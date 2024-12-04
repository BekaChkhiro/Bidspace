import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.FallbackComponent ? 
        <this.props.FallbackComponent error={this.state.error} /> : 
        <div>დაფიქსირდა შეცდომა.</div>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;