import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  PACKAGE_DEFINITIONS,
  SOURCE_MODES,
  resolveSourceLoader,
  runHeartbeat,
} from "../../src/packageHeartbeats.js";
import { Application, Container, Graphics } from "pixi.js";
import { FiArrowDown, FiArrowLeft, FiArrowRight, FiArrowUp, FiRotateCcw } from "react-icons/fi";

const SOURCE_LIST = [SOURCE_MODES.published, SOURCE_MODES.workspace];

function statusLabel(status) {
  if (status === "pass") return "PASS";
  if (status === "fail") return "FAIL";
  if (status === "running") return "RUNNING";
  return "IDLE";
}

function statusClass(status) {
  if (status === "pass") return "status-pass";
  if (status === "fail") return "status-fail";
  if (status === "running") return "status-running";
  return "status-idle";
}

function routeKey(packageId, sourceMode) {
  return `${packageId}:${sourceMode}`;
}

function routePath(packageId, sourceMode) {
  return `/${packageId}/${sourceMode}`;
}

function addDemoGeometry(target) {
  const axis = new Graphics();
  axis
    .moveTo(-280, 0)
    .lineTo(280, 0)
    .moveTo(0, -140)
    .lineTo(0, 140)
    .stroke({ width: 2, color: 0x38bdf8, alpha: 0.8 });

  const rect = new Graphics();
  rect
    .rect(-70, -50, 140, 100)
    .fill(0x1d4ed8)
    .stroke({ width: 3, color: 0xffffff, alpha: 0.7 });

  const circle = new Graphics();
  circle
    .circle(130, 0, 36)
    .fill(0x14b8a6)
    .stroke({ width: 2, color: 0xe2e8f0, alpha: 0.9 });

  const triangle = new Graphics();
  triangle
    .poly([-120, 65, -80, 118, -160, 118])
    .fill(0xf59e0b)
    .stroke({ width: 2, color: 0x1f2937, alpha: 1 });

  target.addChild(axis, rect, circle, triangle);
}

function resolveRoute(packageId, sourceMode) {
  const safePackageId = PACKAGE_DEFINITIONS.some((pkg) => pkg.id === packageId)
    ? packageId
    : PACKAGE_DEFINITIONS[0].id;
  const safeSourceMode = SOURCE_LIST.includes(sourceMode) ? sourceMode : SOURCE_MODES.published;
  return { packageId: safePackageId, sourceMode: safeSourceMode };
}

function createDemoObserver(setDemo, readState) {
  return () => {
    const next = readState();
    setDemo({
      status: "ready",
      zoom: next.zoom,
      x: next.x,
      y: next.y,
      error: null,
    });
  };
}

function createDemoController({ observe, onSetZoom, onPanBy, onResetView, onDestroy }) {
  return {
    setZoom(value) {
      onSetZoom?.(value);
      observe();
    },
    panBy(dx, dy) {
      onPanBy(dx, dy);
      observe();
    },
    resetView() {
      onResetView();
      observe();
    },
    destroy() {
      onDestroy();
    },
  };
}

function DemoStats({ x, y, compact = false }) {
  const className = compact ? "demo-stats demo-stats-compact" : "demo-stats";
  return (
    <div className={className}>
      <span>X: {x}</span>
      <span>Y: {y}</span>
    </div>
  );
}

export default function PackageValidatorRoute() {
  const params = useParams();
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const rootDemoMountRef = useRef(null);
  const rootDemoApiRef = useRef(null);
  const [results, setResults] = useState({});
  const [runningAll, setRunningAll] = useState(false);
  const [demo, setDemo] = useState({
    status: "idle",
    zoom: 1,
    x: 0,
    y: 0,
    error: null,
  });
  const [dragStep, setDragStep] = useState(20);

  const resolvedRoute = resolveRoute(params.packageId, params.sourceMode);
  const selected = useMemo(
    () => PACKAGE_DEFINITIONS.find((pkg) => pkg.id === resolvedRoute.packageId) || PACKAGE_DEFINITIONS[0],
    [resolvedRoute.packageId],
  );
  const selectedSourceMode = resolvedRoute.sourceMode;
  const selectedPackageId = selected.id;
  const isDragRoute = selectedPackageId === "drag";

  useEffect(() => {
    if (params.packageId !== resolvedRoute.packageId || params.sourceMode !== resolvedRoute.sourceMode) {
      navigate(routePath(resolvedRoute.packageId, resolvedRoute.sourceMode), { replace: true });
    }
  }, [navigate, params.packageId, params.sourceMode, resolvedRoute.packageId, resolvedRoute.sourceMode]);

  useEffect(() => {
    const api = rootDemoApiRef.current;
    if (api) {
      api.destroy();
      rootDemoApiRef.current = null;
    }
    if (rootDemoMountRef.current) {
      rootDemoMountRef.current.innerHTML = "";
    }

    let cancelled = false;

    async function setupDemo() {
      setDemo({ status: "loading", zoom: 1, x: 0, y: 0, error: null });

      const mountNode = rootDemoMountRef.current;
      if (!mountNode) {
        return;
      }

      try {
        const mod = await resolveSourceLoader(selected, selectedSourceMode)();
        const app = new Application();
        mountNode.innerHTML = "";
        await app.init({
          resizeTo: mountNode,
          antialias: true,
          backgroundColor: 0x0f172a,
        });

        if (cancelled) {
          app.destroy(true);
          return;
        }

        app.canvas.style.display = "block";
        mountNode.appendChild(app.canvas);

        if (selectedPackageId === "root-container") {
          const rootResult = mod.createRootContainer(app);
          app.stage.addChild(rootResult.root);
          const zoomResult = mod.createZoomPan(app, rootResult.root);
          rootResult.root.addChild(zoomResult.zoomPan);
          addDemoGeometry(zoomResult.zoomPan);

          const drag = mod.makeStageDraggable(app, zoomResult.zoomPan);
          const zoom = mod.makeStageZoomable(app, zoomResult.zoomPan, { minZoom: 0.25, maxZoom: 2.5, zoomSpeed: 0.08 });

          const observe = createDemoObserver(setDemo, () => ({
            zoom: Number(zoom.getZoom().toFixed(2)),
            x: Math.round(zoomResult.zoomPan.position.x),
            y: Math.round(zoomResult.zoomPan.position.y),
          }));
          observe();

          rootDemoApiRef.current = createDemoController({
            observe,
            onSetZoom(value) {
              zoom.setZoom(value);
            },
            onPanBy(dx, dy) {
              zoomResult.zoomPan.position.set(zoomResult.zoomPan.position.x + dx, zoomResult.zoomPan.position.y + dy);
            },
            onResetView() {
              zoom.setZoom(1);
              zoomResult.zoomPan.position.set(0, 0);
            },
            onDestroy() {
              drag.destroy();
              zoom.destroy();
              zoomResult.destroy();
              rootResult.destroy();
              app.destroy(true);
              if (mountNode) {
                mountNode.innerHTML = "";
              }
            },
          });
          return;
        }

        if (selectedPackageId === "grid") {
          const zoomPan = new Container();
          app.stage.addChild(zoomPan);
          addDemoGeometry(zoomPan);

          const manager = new mod.GridManager({
            application: app,
            zoomPanContainer: zoomPan,
            cache: {
              enabled: true,
              resolution: 2,
              antialias: true,
              debug: { logIntervalMs: 250 },
            },
            gridSpec: {
              grid: { x: 24, y: 24, color: 0x2f3f5f, alpha: 0.7 },
              gridMajor: { x: 120, y: 120, color: 0x5d7bd6, alpha: 0.9 },
              artboard: { x: -160, y: -100, width: 320, height: 200, color: 0xffffff, alpha: 0.6 },
            },
          });

          const emitZoom = () => app.stage.emit("stage-zoom");
          const emitDrag = () => app.stage.emit("stage-drag");
          const observe = createDemoObserver(setDemo, () => ({
            zoom: Number(zoomPan.scale.x.toFixed(2)),
            x: Math.round(zoomPan.position.x),
            y: Math.round(zoomPan.position.y),
          }));
          observe();

          rootDemoApiRef.current = createDemoController({
            observe,
            onSetZoom(value) {
              zoomPan.scale.set(value);
              emitZoom();
            },
            onPanBy(dx, dy) {
              zoomPan.position.set(zoomPan.position.x + dx, zoomPan.position.y + dy);
              emitDrag();
            },
            onResetView() {
              zoomPan.scale.set(1);
              zoomPan.position.set(0, 0);
              emitZoom();
              emitDrag();
            },
            onDestroy() {
              manager.cleanup();
              app.destroy(true);
              if (mountNode) {
                mountNode.innerHTML = "";
              }
            },
          });
          return;
        }

        if (selectedPackageId === "drag") {
          const square = new Graphics().rect(-35, -35, 70, 70).fill(0x1d4ed8).stroke({ width: 2, color: 0xffffff, alpha: 0.8 });
          square.position.set(app.screen.width / 2, app.screen.height / 2);
          app.stage.addChild(square);

          let pointerX = 0;
          let pointerY = 0;
          const observe = createDemoObserver(setDemo, () => ({
            zoom: 1,
            x: Math.round(square.position.x),
            y: Math.round(square.position.y),
          }));
          const store = new mod.DragStore({
            app,
            callbacks: {
              onDrag(state) {
                square.position.set(state.initialItemX + state.deltaX, state.initialItemY + state.deltaY);
                observe();
              },
              onDragEnd() {
                observe();
              },
            },
          });

          observe();

          rootDemoApiRef.current = createDemoController({
            observe,
            onSetZoom() {},
            onPanBy(dx, dy) {
              if (!store.value.isDragging) {
                store.startDrag("demo-item", pointerX, pointerY, square.position.x, square.position.y);
              }
              pointerX += dx;
              pointerY += dy;
              store.updateDrag(pointerX, pointerY);
              const position = store.getCurrentItemPosition();
              if (position) {
                square.position.set(position.x, position.y);
              }
            },
            onResetView() {
              store.cancelDrag();
              pointerX = 0;
              pointerY = 0;
              square.position.set(app.screen.width / 2, app.screen.height / 2);
            },
            onDestroy() {
              store.destroy();
              app.destroy(true);
              if (mountNode) {
                mountNode.innerHTML = "";
              }
            },
          });
        }
      } catch (error) {
        if (!cancelled) {
          setDemo({
            status: "fail",
            zoom: 1,
            x: 0,
            y: 0,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    setupDemo();

    return () => {
      cancelled = true;
      const currentApi = rootDemoApiRef.current;
      if (currentApi) {
        currentApi.destroy();
        rootDemoApiRef.current = null;
      }
    };
  }, [selected, selectedSourceMode, selectedPackageId]);

  async function runOne(packageDef, sourceMode) {
    const key = routeKey(packageDef.id, sourceMode);
    setResults((prev) => ({
      ...prev,
      [key]: { status: "running" },
    }));

    const result = await runHeartbeat(packageDef, sourceMode, mountRef.current);
    setResults((prev) => ({ ...prev, [key]: result }));
  }

  async function runAllRoutes() {
    setRunningAll(true);
    try {
      for (const pkg of PACKAGE_DEFINITIONS) {
        for (const sourceMode of SOURCE_LIST) {
          await runOne(pkg, sourceMode);
        }
      }
    } finally {
      setRunningAll(false);
    }
  }

  const selectedKey = routeKey(selected.id, selectedSourceMode);
  const selectedResult = results[selectedKey];
  const allResults = Object.values(results);
  const passCount = allResults.filter((result) => result?.status === "pass").length;
  const failCount = allResults.filter((result) => result?.status === "fail").length;
  const totalRoutes = PACKAGE_DEFINITIONS.length * SOURCE_LIST.length;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="button-row">
          <button
            type="button"
            onClick={() => runOne(selected, selectedSourceMode)}
            disabled={selectedResult?.status === "running" || runningAll}
          >
            Run Route
          </button>
          <button type="button" onClick={runAllRoutes} disabled={runningAll}>
            Run All Routes
          </button>
        </div>
        <div className="summary">
          <span>{passCount} pass</span>
          <span>{failCount} fail</span>
          <span>{totalRoutes} total routes</span>
        </div>
        <nav>
          {PACKAGE_DEFINITIONS.map((pkg) => {
            const publishedStatus = results[routeKey(pkg.id, SOURCE_MODES.published)]?.status ?? "idle";
            const workspaceStatus = results[routeKey(pkg.id, SOURCE_MODES.workspace)]?.status ?? "idle";

            return (
              <div key={pkg.id} className="nav-group">
                <div className="nav-title">{pkg.workspaceImport}</div>
                <Link
                  to={routePath(pkg.id, SOURCE_MODES.published)}
                  className={`nav-link ${
                    selected.id === pkg.id && selectedSourceMode === SOURCE_MODES.published ? "active" : ""
                  }`}
                >
                  <span>published</span>
                  <span className={statusClass(publishedStatus)}>{statusLabel(publishedStatus)}</span>
                </Link>
                <Link
                  to={routePath(pkg.id, SOURCE_MODES.workspace)}
                  className={`nav-link ${
                    selected.id === pkg.id && selectedSourceMode === SOURCE_MODES.workspace ? "active" : ""
                  }`}
                >
                  <span>workspace</span>
                  <span className={statusClass(workspaceStatus)}>{statusLabel(workspaceStatus)}</span>
                </Link>
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="content">
        <div className="content-top">
          <header className="content-header">
            <h2>{selected.workspaceImport}</h2>
            <span className={statusClass(selectedResult?.status ?? "idle")}>
              {statusLabel(selectedResult?.status ?? "idle")}
            </span>
          </header>
          <div className="source-tabs">
            <Link
              to={routePath(selected.id, SOURCE_MODES.published)}
              className={`source-tab ${selectedSourceMode === SOURCE_MODES.published ? "active" : ""}`}
            >
              published
            </Link>
            <Link
              to={routePath(selected.id, SOURCE_MODES.workspace)}
              className={`source-tab ${selectedSourceMode === SOURCE_MODES.workspace ? "active" : ""}`}
            >
              workspace
            </Link>
          </div>

          {selectedResult?.error && (
            <div className="error-box">
              <strong>Error:</strong> {selectedResult.error}
            </div>
          )}
        </div>

        <section className="demo-panel">
          <div className="demo-controls">
            <div className="control-split">
              <div className="zoom-controls">
                <label className="zoom-label" htmlFor="zoom-slider">
                  {isDragRoute ? `Step: ${dragStep}px` : `Zoom: ${demo.zoom.toFixed(2)}x`}
                </label>
                <input
                  id="zoom-slider"
                  type="range"
                  min={isDragRoute ? "5" : "0.25"}
                  max={isDragRoute ? "60" : "2.5"}
                  step={isDragRoute ? "1" : "0.01"}
                  value={isDragRoute ? dragStep : demo.zoom}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value);
                    if (isDragRoute) {
                      setDragStep(nextValue);
                      return;
                    }
                    rootDemoApiRef.current?.setZoom(nextValue);
                  }}
                  disabled={demo.status !== "ready"}
                />
              </div>
              <div className="pan-controls">
                <div className="pan-buttons">
                  <div className="pan-pad" role="group" aria-label="Pan controls">
                    <button
                      type="button"
                      className="icon-button pan-up"
                      onClick={() => rootDemoApiRef.current?.panBy(0, -(isDragRoute ? dragStep : 20))}
                      disabled={demo.status !== "ready"}
                      aria-label="Pan up"
                      title="Pan up"
                    >
                      <FiArrowUp />
                    </button>
                    <button
                      type="button"
                      className="icon-button pan-left"
                      onClick={() => rootDemoApiRef.current?.panBy(-(isDragRoute ? dragStep : 20), 0)}
                      disabled={demo.status !== "ready"}
                      aria-label="Pan left"
                      title="Pan left"
                    >
                      <FiArrowLeft />
                    </button>
                    <button
                      type="button"
                      className="icon-button pan-right"
                      onClick={() => rootDemoApiRef.current?.panBy(isDragRoute ? dragStep : 20, 0)}
                      disabled={demo.status !== "ready"}
                      aria-label="Pan right"
                      title="Pan right"
                    >
                      <FiArrowRight />
                    </button>
                    <button
                      type="button"
                      className="icon-button pan-down"
                      onClick={() => rootDemoApiRef.current?.panBy(0, isDragRoute ? dragStep : 20)}
                      disabled={demo.status !== "ready"}
                      aria-label="Pan down"
                      title="Pan down"
                    >
                      <FiArrowDown />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="icon-button reset-button"
                    onClick={() => rootDemoApiRef.current?.resetView()}
                    disabled={demo.status !== "ready"}
                    aria-label="Reset view"
                    title="Reset view"
                  >
                    <FiRotateCcw />
                  </button>
                  <DemoStats x={demo.x} y={demo.y} compact />
                </div>
              </div>
            </div>
            {demo.error && (
              <div className="error-box">
                <strong>Demo Error:</strong> {demo.error}
              </div>
            )}
          </div>
          <div className="pixi-mount" ref={rootDemoMountRef} />
        </section>
        <div className="runtime-mount" ref={mountRef} aria-hidden />
      </main>
    </div>
  );
}
