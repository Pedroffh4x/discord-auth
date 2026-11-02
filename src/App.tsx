import React from 'react';
import Hero from './components/ui/animated-shader-hero';
import DiscordAuthCard from './DiscordAuthCard';

const App: React.FC = () => {
 const handlePrimaryClick = () => {
 console.log('Get Started clicked!');
 };

 const handleSecondaryClick = () => {
 console.log('Explore Features clicked!');
 };

 return (
 <div
 style={{
 position: 'fixed',
 top: 0,
 left: 0,
 width: '100vw',
 height: '100vh',
 overflow: 'hidden',
 }}
 >
 {/* Shader Hero as full-screen background */}
 <Hero
 trustBadge={{
 text: "Trusted by forward-thinking teams.",
 icons: ["✨"]
 }}
 headline={{
 line1: "Launch Your",
 line2: "Workflow Into Orbit"
 }}
 subtitle="Supercharge productivity with AI-powered automation and integrations built for the next generation of teams — fast, seamless, and limitless."
 buttons={{
 primary: {
 text: "Get Started for Free",
 onClick: handlePrimaryClick
 },
 secondary: {
 text: "Explore Features",
 onClick: handleSecondaryClick
 }
 }}
 />

 {/* Auth card centered above the hero background */}
 <div
 style={{
 position: 'absolute',
 top: 0,
 left: 0,
 width: '100%',
 height: '100%',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 zIndex: 10,
 pointerEvents: 'none',
 }}
 >
 <div style={{ pointerEvents: 'auto' }}>
 <DiscordAuthCard />
 </div>
 </div>
 </div>
 );
};

export default App;