# CHANGELOG

## 1.0

Achieved a basic system to use nested containers / tree system
to express flex -like containment in pixi

## 1.0.1 

Refactored for a single - class expression; full reboot with
fewer size modes and more robust updating. Fully removed all pixi/
rendering from the boxes; child classes/external utilities responsible
for rendering content.

## 1.1.1 - 2026-02-27

- Instituted a deeper style-key pattern using dot-separated noun parts, with interCaps compatibility in style-tree.
- Raised the Node runtime baseline to `>=20.0.0`.
