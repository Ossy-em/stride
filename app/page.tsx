import Link from 'next/link';
import { ArrowRight, Play, Brain, Shield, TrendingUp, Zap, Target, Lightbulb, Check, X } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Problem Section */}
      <ProblemSection />
      
      {/* How It Works */}
      <HowItWorksSection />
      
      {/* Features */}
      <FeaturesSection />
      
      {/* Social Proof */}
      <SocialProofSection />
      
      {/* Final CTA */}
      <FinalCTASection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-purple-50 -z-10" />
      
      {/* Blur Orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Your AI knows when you're about to{' '}
              <span className="bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">
                lose focus.
              </span>
              <br />
              You don't.
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl">
              You've felt it before - that moment right before you check Twitter. 
              Before you open a new tab. Before the next 20 minutes disappear.
              <br /><br />
              <span className="font-semibold text-gray-800">
                Stride catches that moment.
              </span> Five minutes before you typically break focus, 
              it intervenes with strategies that actually work for you. Not generic advice. 
              Not willpower. Just data.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                href="/signup"
                className="group px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-full text-lg hover:shadow-2xl hover:shadow-teal-500/30 transition-all hover:-translate-y-1"
              >
                Join the Waitlist
                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <a 
                href="#how-it-works"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full text-lg hover:border-teal-500 hover:text-teal-600 transition-all"
              >
                See How It Works ↓
              </a>
            </div>
          </div>

          {/* Right: Hero Visual */}
          <div className="relative">
            <div className="relative mx-auto max-w-md lg:max-w-lg">
              {/* Image Placeholder */}
              <div className="aspect-[9/16] bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-purple-500/10" />
                <div className="relative z-10 text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-teal-500 rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 font-mono mb-2">[IMAGE: hero-phone-mockup]</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    iPhone mockup showing Stride timer (42:15) with notification: 
                    "You're at your 45-min limit. Time for a 5-min walk?"
                  </p>
                </div>
              </div>
              
              {/* Floating shadow effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-teal-500/20 blur-2xl -z-10 translate-y-8" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Problem Section
function ProblemSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold mb-8">
          You lose hours you don't even realize are gone
        </h2>
        
        <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed space-y-6">
          <p>
            It's not a lack of discipline. You sit down to work, genuinely focused. 
            Then somehow it's 2pm and you've accomplished one thing.
          </p>
          
          <p>
            The problem isn't that you get distracted. It's that you don't notice 
            the moment <span className="font-semibold text-gray-800">BEFORE</span> distraction. 
            That split second where your brain decides "just a quick check..."
          </p>
          
          <p>
            Blockers don't work - they're too rigid. Timers don't adapt. Willpower alone? 
            You've already tried that.
          </p>
          
          <p className="text-2xl font-semibold text-gray-900">
            What if something could predict that moment for you?
          </p>
        </div>

        {/* Visual Placeholder */}
        <div className="mt-16 aspect-[16/6] bg-gradient-to-r from-teal-50 via-amber-50 to-coral-50 rounded-2xl shadow-lg flex items-center justify-center">
          <div className="text-center p-8">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-teal-500" />
            <p className="text-sm text-gray-600 font-mono mb-2">[IMAGE: distraction-timeline]</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Timeline showing: focused person (teal glow) → decision point (amber warning) → distracted (coral, multiple tabs)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Three steps. Zero surveillance.
          </h2>
        </div>

        {/* Step 1 */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="order-2 lg:order-1">
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl flex items-center justify-center">
              <div className="text-center p-8">
                <Play className="w-12 h-12 mx-auto mb-4 text-teal-500" />
                <p className="text-sm text-gray-600 font-mono mb-2">[IMAGE: session-start-ui]</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  MacBook screen showing start session form: task input, type dropdown, duration slider, teal button
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wide">Step 1</span>
            </div>
            
            <h3 className="text-3xl font-bold mb-4">One-click sessions</h3>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Start a focus session. Work. When you're done, rate your focus (1-10). 
              That's it. No tab monitoring. No screen recording. No creepy tracking.
            </p>
            
            <p className="text-lg text-gray-800 font-semibold">
              You tell Stride what happened. It learns from what you share.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-purple-600 font-semibold text-sm uppercase tracking-wide">Step 2</span>
            </div>
            
            <h3 className="text-3xl font-bold mb-4">Patterns you'd never notice</h3>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              After 5 sessions, Stride knows more about your focus than you do.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-teal-600" />
                </div>
                <p className="text-gray-700">"You lose concentration after 45 minutes on coding tasks."</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-teal-600" />
                </div>
                <p className="text-gray-700">"Your reading sessions are 40% better before lunch."</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-teal-600" />
                </div>
                <p className="text-gray-700">"Friday afternoons? Don't even try deep work."</p>
              </div>
            </div>
            
            <p className="text-lg text-gray-800 font-semibold">
              It doesn't judge. It just knows.
            </p>
          </div>

          <div>
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl flex items-center justify-center">
              <div className="text-center p-8">
                <Brain className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                <p className="text-sm text-gray-600 font-mono mb-2">[IMAGE: ai-insights-dashboard]</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Dashboard with focus score (87/100), weekly heatmap, 3 insight cards with icons
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl flex items-center justify-center">
              <div className="text-center p-8">
                <Shield className="w-12 h-12 mx-auto mb-4 text-amber" />
                <p className="text-sm text-gray-600 font-mono mb-2">[IMAGE: intervention-notification]</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Browser notification over code editor: "You're at 42 mins - time for a 5-min walk?"
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-amber font-semibold text-sm uppercase tracking-wide">Step 3</span>
            </div>
            
            <h3 className="text-3xl font-bold mb-4">Catches you before the scroll</h3>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Here's what makes Stride different: it doesn't wait until you're already distracted.
            </p>
            
            <div className="bg-teal-50 border-l-4 border-teal-500 p-6 rounded-r-lg mb-6">
              <p className="text-gray-700 mb-2">At 40 minutes (5 minutes before you typically lose focus):</p>
              <p className="text-lg font-semibold text-gray-900">
                "You're at your usual limit. Take a 5-minute walk?"
              </p>
            </div>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              Not generic advice. Not after you've lost 20 minutes. <span className="font-bold text-gray-900">BEFORE.</span>
            </p>
            
            <p className="text-lg text-gray-800 font-semibold">
              And if "take a break" doesn't work? Stride tries "switch tasks" next time. 
              It learns what actually works for you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Feature 1: Predictive Interventions */}
        <div className="mb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-4">
                Predictive AI
              </div>
              <h3 className="text-4xl font-bold mb-6">
                Catches you before the scroll
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                Most "focus apps" react after you're already distracted. 
                Stride predicts the moment and intervenes 5 minutes early.
              </p>
              <p className="text-lg text-gray-800 font-semibold">
                Because by the time you realize you're distracted, 
                you've already lost 20 minutes.
              </p>
            </div>

            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl flex items-center justify-center">
              <div className="text-center p-8">
                <Target className="w-12 h-12 mx-auto mb-4 text-teal-500" />
                <p className="text-sm text-gray-600 font-mono mb-2">[IMAGE: prediction-timeline]</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Comparison: Other apps (notification at 45:00, too late) vs Stride (notification at 40:00, prevents distraction)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Personalized Insights */}
        <div className="mb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl flex items-center justify-center">
                <div className="text-center p-8">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-amber" />
                  <p className="text-sm text-gray-600 font-mono mb-2">[IMAGE: ai-insights-dashboard]</p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    (Reuse dashboard screenshot from Step 2)
                  </p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-block px-4 py-2 bg-amber/20 text-amber-700 rounded-full text-sm font-semibold mb-4">
                Deep Learning
              </div>
              <h3 className="text-4xl font-bold mb-6">
                Your brain, decoded
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                Stride doesn't give you the same generic advice as everyone else.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">YOUR</span> optimal session length for each task type
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <p className="text-lg text-gray-700">
                    When <span className="font-semibold">YOU</span> focus best (and when you absolutely don't)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <p className="text-lg text-gray-700">
                    What recovery strategies work for <span className="font-semibold">YOU</span> specifically
                  </p>
                </div>
              </div>

              <p className="text-lg text-gray-800 font-semibold">
                This isn't productivity theater. It's data.
              </p>
            </div>
          </div>
        </div>

        {/* Feature 3: Privacy */}
        <div className="mb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
                Privacy First
              </div>
              <h3 className="text-4xl font-bold mb-6">
                Zero surveillance. Just self-reports.
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-700">Stride doesn't watch your screen</p>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-700">Doesn't monitor your tabs</p>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-700">Doesn't track what websites you visit</p>
                </div>
              </div>

              <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-lg text-gray-900 font-semibold mb-2">You rate your focus after each session.</p>
                    <p className="text-gray-600">That's the only data it needs.</p>
                  </div>
                </div>
              </div>

              <p className="text-lg text-gray-800 font-semibold mt-6">
                The AI learns from what YOU tell it, not from spying on you.
              </p>
            </div>

            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl flex items-center justify-center">
              <div className="text-center p-8">
                <Shield className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                <p className="text-sm text-gray-600 font-mono mb-2">[IMAGE: privacy-shield]</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Shield with "No tracking" badge, crossed-out icons (screen recording, tab monitoring), checkmark for rating slider
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4: Adaptive Strategies */}
        <div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl flex items-center justify-center">
                <div className="text-center p-8">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-teal-500" />
                  <p className="text-sm text-gray-600 font-mono mb-2">[IMAGE: ab-testing-results]</p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Bar chart: "Take Break" 70%, "Switch Task" 45%, "Push Through" 30%. Title: "What Works For You"
                  </p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-block px-4 py-2 bg-amber/20 text-amber-700 rounded-full text-sm font-semibold mb-4">
                Self-Improving
              </div>
              <h3 className="text-4xl font-bold mb-6">
                Learns what works, drops what doesn't
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                If "take a break" fails 3 times, Stride switches to "switch tasks."
                If morning interventions get dismissed but afternoon ones work, it adapts.
              </p>
              
              <div className="bg-gradient-to-r from-teal-50 to-amber-50 border-2 border-teal-200 rounded-xl p-6 mb-6">
                <p className="text-lg text-gray-900 font-semibold mb-2">
                  This isn't a rigid system with one-size-fits-all rules.
                </p>
                <p className="text-gray-700">
                  It's an AI that actually learns YOUR behavior.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// Social Proof Section
function SocialProofSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-teal-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-6">
          Building in Public
        </div>
        
        <h2 className="text-4xl font-bold mb-4">
          Follow along as we build Stride
        </h2>
        
        <p className="text-xl text-gray-600 mb-12">
          We're launching in 4 weeks. Here's our progress so far.
        </p>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-teal-100">
            <div className="text-5xl font-bold text-teal-600 mb-2">327</div>
            <div className="text-gray-600 font-medium">Focus sessions tracked</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-teal-100">
            <div className="text-5xl font-bold text-teal-600 mb-2">1,847</div>
            <div className="text-gray-600 font-medium">Hours analyzed</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-teal-100">
            <div className="text-5xl font-bold text-teal-600 mb-2">73%</div>
            <div className="text-gray-600 font-medium">Intervention success rate</div>
          </div>
        </div>

        {/* Twitter Embed Placeholder */}
        <div className="bg-white rounded-2xl p-12 shadow-lg border-2 border-gray-200">
          <p className="text-gray-500 italic mb-4">
            [Embedded Twitter/X timeline or recent build tweets]
          </p>
          <a 
            href="https://twitter.com/yourusername" 
            target="_blank"
            className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700"
          >
            Follow our build journey on Twitter
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

// Final CTA Section
function FinalCTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-teal-600 to-purple-600 -z-10" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="mb-12">
          <div className="aspect-[16/9] max-w-2xl mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl shadow-2xl flex items-center justify-center border border-white/20">
            <div className="text-center p-8">
              <Zap className="w-16 h-16 mx-auto mb-4 text-white" />
              <p className="text-sm text-white/80 font-mono mb-2">[IMAGE: final-cta-visual]</p>
              <p className="text-xs text-white/60 max-w-md mx-auto">
                Time transformation: blurred hours slipping away → sharp focused hours (teal blocks). Arrow showing transformation.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6">
          Stop losing hours you don't even realize are gone
        </h2>
        
        <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
          Join the waitlist. We're launching in 4 weeks.
        </p>

        <Link 
          href="/signup"
          className="inline-block px-12 py-5 bg-white text-teal-600 font-bold text-xl rounded-full hover:bg-gray-50 hover:shadow-2xl transition-all hover:-translate-y-1"
        >
          Get Early Access
        </Link>

        <p className="mt-6 text-white/70 text-sm">
          No credit card required. Just your email.
        </p>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-12 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            <span className="font-semibold text-lg">Stride</span>
          </div>

          <div className="flex gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="https://twitter.com" target="_blank" className="hover:text-white transition-colors">Twitter</a>
          </div>

          <div className="text-sm text-gray-500">
            © 2026 Stride. Built in public.
          </div>
        </div>
      </div>
    </footer>
  );
}

// Features Section (continued in next message due to length...)