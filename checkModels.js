const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyD6cm1XzN-WQY-ib0F_Nrs9zG07WngD3MA';
fetch(url)
  .then(r => r.json())
  .then(data => {
    if (data.error) {
       console.log('API ERROR:', data.error.message);
    } else {
       const generateModels = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
       console.log('Valid models:', generateModels.map(m => m.name.replace('models/', '')).join(', '));
       console.log('===== END =====');
    }
  }).catch(e => console.error(e));
