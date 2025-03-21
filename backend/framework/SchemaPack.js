/*jslint node:true*/
module.exports = {
    User: require("../services/user/UserSchema.js").User,
    Schedule: require("../services/schedule/ScheduleSchema.js").Schedule,
    ChatActivity: require("../services/activity/ActivitySchema.js").ChatActivity,
    ChatCozeActivity: require("../services/activity/ActivitySchema.js").ChatCozeActivity,
    PointAccount: require("../services/point/PointSchema.js").PointAccount,
    Transaction: require("../services/point/PointSchema.js").Transaction,
    ApifyTwitter: require("../services/scraper/ScraperSchema.js").ApifyTwitter,
    SymbolLog: require("../services/twitter/TwitterSchema.js").SymbolLog
};
