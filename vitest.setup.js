import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

if (!globalThis.scrollTo) {
	globalThis.scrollTo = vi.fn();
}

if (typeof window !== 'undefined') {
	Object.defineProperty(window, 'scrollTo', {
		value: vi.fn(),
		writable: true,
	});
}

if (!globalThis.ResizeObserver) {
	class ResizeObserver {
		constructor(callback) {
			this.callback = callback;
		}
		observe() {
			this.callback([{ contentRect: { width: 800, height: 600 } }]);
		}
		unobserve() {}
		disconnect() {}
	}
	globalThis.ResizeObserver = ResizeObserver;
}

if (!globalThis.IntersectionObserver) {
  class IntersectionObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.elements = new Set();
    }
    observe(element) {
      this.elements.add(element);
    }
    unobserve(element) {
      this.elements.delete(element);
    }
    disconnect() {
      this.elements.clear();
    }
  }
  globalThis.IntersectionObserver = IntersectionObserver;
}

if (typeof HTMLElement !== 'undefined') {
	HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
		return {
			width: 800,
			height: 600,
			top: 0,
			left: 0,
			bottom: 600,
			right: 800,
		};
	};
}

vi.mock('next/image', () => ({
	default: (props) => {
		const {
			src,
			alt,
			fill,
			sizes,
			priority,
			fetchPriority,
			blurDataURL,
			placeholder,
			...rest
		} = props;
		const imgProps = {
			src: typeof src === 'string' ? src : src?.src || '',
			alt,
			...rest,
		};
		if (fetchPriority) {
			imgProps.fetchpriority = fetchPriority;
		}
		return React.createElement('img', imgProps);
	},
}));

vi.mock('recharts', async () => {
	const React = (await import('react')).default;
	const Mock = ({ children }) => React.createElement('div', null, children);
	return {
		ResponsiveContainer: Mock,
		LineChart: Mock,
		Line: Mock,
		XAxis: Mock,
		YAxis: Mock,
		CartesianGrid: Mock,
		Tooltip: Mock,
		Legend: Mock,
		PieChart: Mock,
		Pie: Mock,
		Cell: Mock,
		BarChart: Mock,
		Bar: Mock,
		AreaChart: Mock,
		Area: Mock,
	};
});
