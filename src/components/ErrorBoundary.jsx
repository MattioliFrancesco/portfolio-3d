import { Component } from 'react';

/**
 * Keeps the page alive if a 3D asset (GLB/textures) fails to load or
 * a WebGL error occurs — the rest of the site keeps working.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('[3D] asset failed:', error);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
