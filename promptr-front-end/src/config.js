const config = {
    dev: {
      API_URL: "http://localhost:5000",
      IS_DEBUG: true
    },
    prod: {
      API_URL: "https://promptr-373321.nn.r.appspot.com",
      IS_DEBUG: false
    }
  };
  
  module.exports = config[process.env.REACT_APP_ENV || "dev"];