const fs = require('fs');
const path = 'd:/Travel/odoo-hackathon/frontend/src/app/pages/Dashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/trip\.image/g, "(trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1593307075574-d5599e6ecf6b?auto=format&fit=crop&q=80&w=1080')");
content = content.replace(/trip\.destination/g, "(trip.destination || 'Unspecified')");
content = content.replace(/trip\.spent/g, "(trip.estimatedTotalCost || 0)");
content = content.replace(/trip\.budget/g, "(trip.budget?.totalBudget || trip.estimatedTotalCost || 1)");

content = content.replace(/dest\.image/g, "(dest.coverPhotoUrl || 'https://images.unsplash.com/photo-1702248786339-d2dc54b9cd7e?auto=format&fit=crop&q=80&w=1080')");
content = content.replace(/dest\.trips/g, "(dest.activityCount || 0)");

fs.writeFileSync(path, content);
console.log('Template fixed!');
