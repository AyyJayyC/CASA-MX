import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import PropertyTypeSelector from '../../components/PropertyTypeSelector.jsx';

function StatefulSelector() {
  const [value, setValue] = useState('Casa');
  return <PropertyTypeSelector value={value} onChange={setValue} />;
}

describe('PropertyTypeSelector', () => {
  it('renders options and keeps a single selection', () => {
    render(<StatefulSelector />);

    const casaInput = screen.getByLabelText('Casa');
    const oficinaInput = screen.getByLabelText('Oficina');

    expect(casaInput).toBeChecked();
    expect(oficinaInput).not.toBeChecked();

    fireEvent.click(screen.getByText('Oficina'));

    expect(oficinaInput).toBeChecked();
    expect(casaInput).not.toBeChecked();
  });
});