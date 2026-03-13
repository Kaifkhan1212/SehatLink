fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCoAWzeApCXuAOQeKOfDIKHW2iCVaq_rgc')
  .then(res => res.json())
  .then(data => {
    console.log("SUPPORTED MODELS:");
    data.models.forEach(m => {
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log(m.name);
      }
    });
  })
  .catch(console.error);
