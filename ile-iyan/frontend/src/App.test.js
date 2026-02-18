import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Ile Iyan brand in navbar', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/Ilé Ìyán/i);
  expect(brandElements.length).toBeGreaterThan(0);
});

test('renders navigation links', () => {
  render(<App />);
  expect(screen.getAllByText(/Our Soups/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Voice Order/i).length).toBeGreaterThan(0);
});

test('renders hero section on home page', () => {
  render(<App />);
  expect(screen.getAllByText(/The Home of Pounded Yam/i).length).toBeGreaterThan(0);
});
