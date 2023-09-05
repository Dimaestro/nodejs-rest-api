const subscriptions = ["starter", "pro", "business"];
// eslint-disable-next-line no-useless-escape
const emailRegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

module.exports = {
  subscriptions,
  emailRegExp
}