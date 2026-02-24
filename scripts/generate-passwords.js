const bcrypt = require('bcryptjs');

async function generatePasswords() {
  const adminHash = await bcrypt.hash('admin123', 12);
  const providerHash = await bcrypt.hash('provider123', 12);
  const userHash = await bcrypt.hash('user123', 12);
  
  console.log('Admin password hash:', adminHash);
  console.log('Provider password hash:', providerHash);
  console.log('User password hash:', userHash);
}

generatePasswords();
