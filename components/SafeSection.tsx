"use client";

import React, { Component, type ReactNode } from "react";

interface Props {
  name?: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SafeSection extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error(`[SafeSection:${this.props.name}]`, error.message);
  }

  render() {
    if (this.state.hasError) {
      // Silently skip broken sections instead of crashing the whole page
      return null;
    }
    return this.props.children;
  }
}
