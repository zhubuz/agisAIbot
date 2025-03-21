var environment = null,
    currentEnv = null,
    mapEnv = {
        local: '',
        dev: 'dev',
        qa: 'qa',
        demo: 'demo',
        st: 'st'
    };
function setEnv(env) {
    currentEnv = env;
    environment = mapEnv[env];
}
function switchDB(dbname) {
    if (environment) {
        dbname = environment + "_" + dbname;
    }
    db = db.getSiblingDB(dbname);
}
