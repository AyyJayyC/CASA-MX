import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertyFilters from '@/components/PropertyFilters';

// Mock fetch
global.fetch = vi.fn();

const mockFilterOptions = {
  estados: ['Ciudad de México', 'Jalisco', 'Nuevo León'],
  ciudadesPorEstado: {
    'Ciudad de México': ['Benito Juárez', 'Cuauhtémoc', 'Miguel Hidalgo'],
    'Jalisco': ['Guadalajara', 'Zapopan', 'Tonalá'],
    'Nuevo León': ['Monterrey', 'San Pedro Garza García', 'Santa Catarina'],
  },
};

describe('PropertyFilters Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockFilterOptions,
    });
  });

  describe('Rendering', () => {
    it('should render filter form with all fields', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Estado \*/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Ciudad/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Colonia/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Código Postal/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Precio Mínimo/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Precio Máximo/)).toBeInTheDocument();
      });
    });

    it('should display loading state initially', () => {
      global.fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      expect(screen.getByText(/Cargando opciones/i)).toBeInTheDocument();
    });

    it('should display error message if fetch fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      await waitFor(() => {
        expect(screen.getByText(/Error cargando opciones/i)).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Estado Selection', () => {
    it('should populate estado dropdown with states', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Ciudad de México' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Jalisco' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Nuevo León' })).toBeInTheDocument();
      });
    });

    it('should call onFilterChange when estado is selected', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      const estadoSelect = await screen.findByLabelText(/Estado \*/);
      await screen.findByRole('option', { name: 'Jalisco' });
      fireEvent.change(estadoSelect, { target: { value: 'Jalisco' } });

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({ estado: 'Jalisco' })
        );
      });
    });

    it('should reset ciudad and colonia when estado changes', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      const estadoSelect = await screen.findByLabelText(/Estado \*/);
      fireEvent.change(estadoSelect, { target: { value: 'Jalisco' } });

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            estado: 'Jalisco',
            ciudad: '',
            colonia: '',
          })
        );
      });
    });
  });

  describe('Ciudad Cascading', () => {
    it('should disable ciudad dropdown when no estado is selected', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      const ciudadSelect = await screen.findByLabelText(/Ciudad/);
      expect(ciudadSelect).toBeDisabled();
    });

    it('should enable ciudad dropdown when estado is selected', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      const estadoSelect = await screen.findByLabelText(/Estado \*/);
      fireEvent.change(estadoSelect, { target: { value: 'Jalisco' } });

      const ciudadSelect = await screen.findByLabelText(/Ciudad/);
      await waitFor(() => {
        expect(ciudadSelect).not.toBeDisabled();
      });
    });

    it('should populate ciudad dropdown based on selected estado', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      const estadoSelect = await screen.findByLabelText(/Estado \*/);
      fireEvent.change(estadoSelect, { target: { value: 'Jalisco' } });

      // Wait for options to appear - check for one specific option
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        const hasGuadalajara = options.some(opt => opt.textContent === 'Guadalajara');
        expect(hasGuadalajara).toBe(true);
      });
    });

    it('should call onFilterChange when ciudad is selected', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      const estadoSelect = await screen.findByLabelText(/Estado \*/);
      fireEvent.change(estadoSelect, { target: { value: 'Jalisco' } });

      const ciudadSelect = await screen.findByLabelText(/Ciudad/);
      fireEvent.change(ciudadSelect, { target: { value: 'Guadalajara' } });

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            ciudad: 'Guadalajara',
            colonia: '', // Should reset colonia
          })
        );
      });
    });
  });

  describe('Colonia Input', () => {
    it('should handle colonia text input', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      const coloniaInput = await screen.findByPlaceholderText(/Roma Norte/);
      fireEvent.change(coloniaInput, { target: { value: 'Polanco' } });

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ colonia: 'Polanco' })
      );
    });
  });

  describe('Código Postal Input', () => {
    it('should only allow digits in código postal', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      const codigoPostalInput = await screen.findByPlaceholderText(/06700/);
      fireEvent.change(codigoPostalInput, { target: { value: 'ABC' } });

      // Should not update since ABC contains letters
      expect(codigoPostalInput.value).not.toBe('ABC');
    });

    it('should limit código postal to 5 digits', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      const codigoPostalInput = await screen.findByPlaceholderText(/06700/);
      fireEvent.change(codigoPostalInput, { target: { value: '0670012345' } });

      // Should not exceed 5 digits
      expect(codigoPostalInput.value.length).toBeLessThanOrEqual(5);
    });

    it('should accept valid 5-digit código postal', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      const codigoPostalInput = await screen.findByPlaceholderText(/06700/);
      fireEvent.change(codigoPostalInput, { target: { value: '06700' } });

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ codigoPostal: '06700' })
      );
    });
  });

  describe('Price Filters', () => {
    it('should handle minPrice input', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      const minPriceLabel = await screen.findByLabelText(/Precio Mínimo/);
      const minPriceInput = minPriceLabel.closest('div').querySelector('input[type="number"]');
      fireEvent.change(minPriceInput, { target: { value: '300000' } });

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ minPrice: '300000' })
      );
    });

    it('should handle maxPrice input', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      const maxPriceLabel = await screen.findByLabelText(/Precio Máximo/);
      const maxPriceInput = maxPriceLabel.closest('div').querySelector('input[type="number"]');
      fireEvent.change(maxPriceInput, { target: { value: '2000000' } });

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ maxPrice: '2000000' })
      );
    });
  });

  describe('Clear Filters', () => {
    it('should have disabled clear button when no filters are active', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      const clearButton = await screen.findByText(/Limpiar Filtros/);
      await waitFor(() => {
        expect(clearButton).toBeDisabled();
      });
    });

    it('should enable clear button when filters are active', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      const estadoSelect = await screen.findByLabelText(/Estado \*/);
      fireEvent.change(estadoSelect, { target: { value: 'Jalisco' } });

      const clearButton = await screen.findByText(/Limpiar Filtros/);
      await waitFor(() => {
        expect(clearButton).not.toBeDisabled();
      });
    });

    it('should clear all filters when button is clicked', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      const estadoSelect = await screen.findByLabelText(/Estado \*/);
      fireEvent.change(estadoSelect, { target: { value: 'Jalisco' } });

      const clearButton = await screen.findByText(/Limpiar Filtros/);
      fireEvent.click(clearButton);

      expect(onFilterChange).toHaveBeenCalledWith({
        estado: '',
        ciudad: '',
        colonia: '',
        codigoPostal: '',
        minPrice: '',
        maxPrice: '',
      });
    });
  });

  describe('Initial Filters', () => {
    it('should populate fields with initial filter values', async () => {
      const initialFilters = {
        estado: 'Jalisco',
        ciudad: 'Guadalajara',
        colonia: 'Providencia',
        codigoPostal: '44630',
        minPrice: '300000',
        maxPrice: '1000000',
      };
      const onFilterChange = vi.fn();
      render(
        <PropertyFilters onFilterChange={onFilterChange} initialFilters={initialFilters} />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Jalisco')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Guadalajara')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Providencia')).toBeInTheDocument();
        expect(screen.getByDisplayValue('44630')).toBeInTheDocument();
        expect(screen.getByDisplayValue('300000')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1000000')).toBeInTheDocument();
      });
    });
  });

  describe('Fetch Filter Options', () => {
    it('should fetch filter options on mount', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/properties/filter-options');
      });
    });

    it('should handle network errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch.mockReset();
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      await waitFor(() => {
        const errorText = screen.queryByText((content) => content.includes('Error cargando opciones'));
        expect(errorText).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Filter Activity Indicator', () => {
    it('should display count of active filters', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      const estadoSelect = await screen.findByLabelText(/Estado \*/);
      fireEvent.change(estadoSelect, { target: { value: 'Jalisco' } });

      const ciudadSelect = await screen.findByLabelText(/Ciudad/);
      fireEvent.change(ciudadSelect, { target: { value: 'Guadalajara' } });

      await waitFor(() => {
        expect(screen.getByText(/2 filtro\(s\) activo\(s\)/)).toBeInTheDocument();
      });
    });

    it('should not display filter count when no filters are active', async () => {
      const onFilterChange = vi.fn();
      render(<PropertyFilters onFilterChange={onFilterChange} />);

      await waitFor(() => {
        expect(screen.queryByText(/filtro\(s\) activo\(s\)/)).not.toBeInTheDocument();
      });
    });
  });
});
