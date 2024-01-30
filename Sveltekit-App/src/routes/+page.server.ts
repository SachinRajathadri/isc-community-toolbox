import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import {
	checkIdnSession,
	checkSession,
	generateAuthLink,
	getSession,
	getToken
} from '$lib/utils/oauth';

export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();

		const baseUrl = data.get('baseUrl');
		const tenantUrl = data.get('tenantUrl');

		if (!baseUrl || !tenantUrl) {
			redirect(302, '/login');
		}

		const session = { baseUrl: baseUrl.toString(), tenantUrl: tenantUrl.toString() };
		console.log('session', session);

		const idnSessionString = cookies.get('idnSession');

		if (idnSessionString) {
			// console.log('sessionString', sessionString);

			const idnSession = JSON.parse(idnSessionString);
			if (idnSession && session.baseUrl.toLowerCase().includes(idnSession.org.toLowerCase())) {
				console.log('Credential Cache Hit');
				redirect(302, '/home');
			} else {
				console.log('Credential Cache Miss');
			}
		}

		cookies.set('session', JSON.stringify(session), {
			path: '/'
		});
		redirect(302, generateAuthLink(tenantUrl.toString()));
	}
} satisfies Actions;

export const load = async ({ locals }) => {
	console.log('locals', locals);
	if (!locals.hasSession || !locals.hasIdnSession) return {};

	if (
		locals.hasSession &&
		locals.hasIdnSession &&
		locals.session.baseUrl.toLowerCase().includes(locals.idnSession.org.toLowerCase())
	) {
		redirect(302, '/home');
	}
	return {};
};
