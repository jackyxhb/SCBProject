import store from '../lib/store/index.js';

(async () => {
  try {
    const res = await (store.purgeExpired ? store.purgeExpired({}) : Promise.resolve({ deleted: 0 }));
    console.log(JSON.stringify({ ok: true, ...res }));
  } catch (e) {
    console.error(JSON.stringify({ ok: false, error: e.message }));
    process.exit(1);
  }
})();
