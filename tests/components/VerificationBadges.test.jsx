import React from 'react';
import { render, screen } from '@testing-library/react';
import VerificationBadges from '@/components/VerificationBadges.jsx';

describe('VerificationBadges', () => {
  it('shows identity verified badge when verified', () => {
    render(React.createElement(VerificationBadges, { identityVerified: true }));
    expect(screen.getByText('Identidad verificada')).toBeInTheDocument();
  });

  it('shows ID uploaded badge when uploaded but not verified', () => {
    render(React.createElement(VerificationBadges, { identityUploaded: true, identityVerified: false }));
    expect(screen.getByText('ID subida')).toBeInTheDocument();
    expect(screen.queryByText('Identidad verificada')).not.toBeInTheDocument();
  });

  it('shows paid subscriber badge', () => {
    render(React.createElement(VerificationBadges, { paidSubscriber: true }));
    expect(screen.getByText('Suscripcion activa')).toBeInTheDocument();
  });

  it('shows all badges together', () => {
    render(React.createElement(VerificationBadges, { identityVerified: true, paidSubscriber: true }));
    expect(screen.getByText('Identidad verificada')).toBeInTheDocument();
    expect(screen.getByText('Suscripcion activa')).toBeInTheDocument();
  });

  it('shows nothing when all false', () => {
    const { container } = render(React.createElement(VerificationBadges));
    expect(container.querySelector('span')).toBeNull();
  });

  it('shows nothing when neither verified nor uploaded', () => {
    const { container } = render(React.createElement(VerificationBadges, { identityVerified: false, identityUploaded: false }));
    expect(container.querySelector('span')).toBeNull();
  });

  it('renders in compact mode', () => {
    render(React.createElement(VerificationBadges, { identityVerified: true, compact: true }));
    const badge = screen.getByText('Identidad verificada');
    expect(badge.className).toContain('text-[11px]');
  });
});
