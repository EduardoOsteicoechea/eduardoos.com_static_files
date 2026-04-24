import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 1424,
		/** SQLite / WAL writes must not trigger dev HMR or full reloads if DB paths are under this tree. */
		watch: {
			ignored: [
				"**/*.db",
				"**/*.db-shm",
				"**/*.db-wal",
				"**/*.sqlite",
				"**/*.sqlite3",
				"**/data/**",
				"../eduardoos.com_backend_20260423/data/**"
			]
		}
	}
});
