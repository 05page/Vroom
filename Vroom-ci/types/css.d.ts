// Déclaration pour les imports CSS side-effect (ex: leaflet/dist/leaflet.css)
// TypeScript strict ne reconnaît pas les imports .css sans cette déclaration.
declare module "*.css" {
  const content: Record<string, string>
  export default content
}
