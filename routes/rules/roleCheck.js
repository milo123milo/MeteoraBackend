function admin(req, res, next) {
  
  if (req.user.role === 'admin' ) {
     return next()
  }
  return res.redirect('/')
 
}
function dbadmin(req, res, next) {
  
  if (req.user.role === 'dbadmin' ) {
     return next()
  }
  return res.status(401).json({ message: 'Invalid user Role' });
 
}

module.exports = {admin, dbadmin}