/*jslint node:true*/
module.exports = {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'input'],
    allowedAttributes: {
        'a': ['href'],
        'input': ['type', 'disabled', 'user-link', 'value']
    }
};