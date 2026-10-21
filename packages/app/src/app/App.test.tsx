import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '@/app';
import { CredentialsSchema } from '@/shared/contracts';

describe('App Component', () => {
	it('renders login page on initial redirect', async () => {
		render(<App />);
		expect(screen.getByTestId('app-root')).toBeInTheDocument();
		expect(await screen.findByTestId('login-page')).toBeInTheDocument();
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Login');
	});
});

describe('Zod Contract Validation', () => {
	it('validates correct credentials correctly', () => {
		const validData = {
			idInstance: '110182',
			apiTokenInstance: 'a'.repeat(50),
		};

		const parsed = CredentialsSchema.safeParse(validData);
		expect(parsed.success).toBe(true);
	});

	it('fails on invalid credentials', () => {
		const invalidData = {
			idInstance: 'abc', // not digits
			apiTokenInstance: 'short',
		};

		const parsed = CredentialsSchema.safeParse(invalidData);
		expect(parsed.success).toBe(false);
		if (!parsed.success) {
			expect(parsed.error.errors.length).toBeGreaterThan(0);
		}
	});
});

