import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import RentalServicesSelector from '../../components/RentalServicesSelector.jsx';

function StatefulSelector() {
  const [selectedServices, setSelectedServices] = useState([]);
  return <RentalServicesSelector selectedServices={selectedServices} onChange={setSelectedServices} />;
}

describe('RentalServicesSelector', () => {
  it('toggles services and updates the summary', () => {
    render(<StatefulSelector />);

    expect(screen.getByText(/No hay servicios seleccionados todavía/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Luz (Electricidad)'));
    fireEvent.click(screen.getByLabelText('Internet'));

    expect(screen.getByText(/Luz \(Electricidad\), Internet/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Luz (Electricidad)'));

    expect(screen.getByText(/Servicios seleccionados: Internet/i)).toBeInTheDocument();
  });
});