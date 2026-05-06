import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RoleSelector from '../../components/RoleSelector.jsx';

describe('RoleSelector', () => {
  it('renders button and shows list on click', () => {
    const onRoleChange = vi.fn();
    render(<RoleSelector currentRole={null} onRoleChange={onRoleChange} />);

    const button = screen.getByRole('button', { name: /Seleccionar rol/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    const option = screen.getByRole('button', { name: /Investor/ });
    expect(option).toBeInTheDocument();

    fireEvent.click(option);
    expect(onRoleChange).toHaveBeenCalledWith('Investor');
  });
});
