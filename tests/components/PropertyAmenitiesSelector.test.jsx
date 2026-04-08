import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import PropertyAmenitiesSelector from '../../components/PropertyAmenitiesSelector.jsx';

function StatefulSelector() {
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  return <PropertyAmenitiesSelector selectedAmenities={selectedAmenities} onChange={setSelectedAmenities} />;
}

describe('PropertyAmenitiesSelector', () => {
  it('expands categories, toggles amenities, and shows summary tags', () => {
    render(<StatefulSelector />);

    expect(screen.getByText(/No hay amenidades seleccionadas todavía/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Clima/i }));
    fireEvent.click(screen.getByLabelText('Aire acondicionado'));

    expect(screen.getByText(/1 amenidades seleccionadas/i)).toBeInTheDocument();
    expect(screen.getAllByText('Aire acondicionado').length).toBeGreaterThan(0);
    expect(screen.getByText(/1 de 5 seleccionadas/i)).toBeInTheDocument();
  });
});