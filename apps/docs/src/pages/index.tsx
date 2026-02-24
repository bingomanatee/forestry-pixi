import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

export default function Home(): JSX.Element {
  return (
    <Layout title="Pixi UX Docs" description="Docs for wonderlandlabs-pixi-ux">
      <main className="homeWrap">
        <h1>wonderlandlabs-pixi-ux</h1>
        <p>Package docs and examples for the monorepo.</p>
        <div className="homeActions">
          <Link className="button button--primary button--lg" to="/intro">
            Read Docs
          </Link>
          <Link className="button button--secondary button--lg" to="/blog">
            View Updates
          </Link>
        </div>
      </main>
    </Layout>
  );
}
