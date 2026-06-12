import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import MoneyInput from '@/components/MoneyInput.jsx';

describe('MoneyInput', () => {
  it('renders with empty display when value is 0', () => {
    const { container } = render(React.createElement(MoneyInput, { value: 0, onChange: vi.fn() }));
    const input = container.querySelector('input');
    expect(input.value).toBe('');
  });

  it('renders formatted value for positive number', () => {
    const { container } = render(React.createElement(MoneyInput, { value: 1500000, onChange: vi.fn() }));
    const input = container.querySelector('input');
    expect(input.value).toBe('1,500,000');
  });

  it('renders with placeholder', () => {
    const { container } = render(React.createElement(MoneyInput, { value: 0, onChange: vi.fn(), placeholder: 'Enter amount' }));
    const input = container.querySelector('input');
    expect(input.placeholder).toBe('Enter amount');
  });

  it('calls onChange with positive number when text changes', () => {
    const onChange = vi.fn();
    const { container } = render(React.createElement(MoneyInput, { value: 0, onChange }));
    const input = container.querySelector('input');
    fireEvent.change(input, { target: { value: '1500000', selectionStart: 7 } });
    expect(onChange).toHaveBeenCalledWith(1500000);
  });

  it('accepts custom className', () => {
    const { container } = render(React.createElement(MoneyInput, { value: 0, onChange: vi.fn(), className: 'form-input' }));
    const input = container.querySelector('input');
    expect(input.className).toContain('form-input');
  });

  it('has numeric inputMode', () => {
    const { container } = render(React.createElement(MoneyInput, { value: 0, onChange: vi.fn() }));
    const input = container.querySelector('input');
    expect(input.inputMode).toBe('numeric');
  });
});
