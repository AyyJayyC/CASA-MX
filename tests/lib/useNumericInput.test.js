import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import useNumericInput from '../../lib/hooks/useNumericInput';

function NumericField({ label, initialValue = 0 }) {
  const [value, setValue] = React.useState(initialValue);
  const numericInput = useNumericInput({ value, onValueChange: setValue, max: 999999 });

  return React.createElement(
    'label',
    null,
    React.createElement('span', null, label),
    React.createElement('input', {
      'aria-label': label,
      value: numericInput.value,
      onFocus: numericInput.handlers.onFocus,
      onChange: numericInput.handlers.onChange,
      onBlur: numericInput.handlers.onBlur,
    })
  );
}

describe('useNumericInput', () => {
  it('clears zero on focus and restores it on blur', () => {
    render(React.createElement(NumericField, { label: 'Renta' }));

    const input = screen.getByLabelText('Renta');
    expect(input).toHaveValue('0');

    fireEvent.focus(input);
    expect(input).toHaveValue('');

    fireEvent.blur(input);
    expect(input).toHaveValue('0');
  });

  it('accepts only numeric characters', () => {
    render(React.createElement(NumericField, { label: 'Depósito' }));

    const input = screen.getByLabelText('Depósito');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '12ab34' } });

    expect(input).toHaveValue('1234');
  });

  it('keeps multiple fields independent', () => {
    render(React.createElement(React.Fragment, null,
      React.createElement(NumericField, { label: 'Recámaras', initialValue: 2 }),
      React.createElement(NumericField, { label: 'Baños', initialValue: 1 })
    ));

    const bedrooms = screen.getByLabelText('Recámaras');
    const bathrooms = screen.getByLabelText('Baños');

    fireEvent.change(bedrooms, { target: { value: '4' } });

    expect(bedrooms).toHaveValue('4');
    expect(bathrooms).toHaveValue('1');
  });
});