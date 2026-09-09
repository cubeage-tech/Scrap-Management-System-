import Counter from './Counter';

const TrustedBy = () => {
  return (
    <>
      {/* Wave Transition (Transitions from Hero Blue to White) */}
      <div className="w-full bg-brand">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto -mt-1 block">
          <path fill="#ffffff" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>

      {/* Trusted By Logos Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 font-bold tracking-widest text-sm mb-12">
            TRUSTED BY INDIA'S LEADING MANUFACTURERS & RECYCLERS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 md:gap-x-16 gap-y-8 text-xl md:text-2xl font-bold text-gray-300">
            {['Tata Steel', 'Mahindra', 'Havells', 'Reliance', 'JSW Steel', 'Hindalco', 'SAIL', 'Vedanta'].map((company) => (
              <span 
                key={company} 
                className="hover:text-brand transition-colors duration-300 cursor-default"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section (Dark Navy Background) */}
      <section className="bg-brand py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
            {/* Stat 1 */}
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-3">
                <Counter end={1284} suffix="+" duration={2500} />
              </div>
              <div className="text-gray-400 text-sm md:text-base">Verified Users</div>
            </div>
            {/* Stat 2 */}
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-3">
                <Counter end={50} prefix="₹" suffix="Cr+" duration={2500} />
              </div>
              <div className="text-gray-400 text-sm md:text-base">Volume Traded (₹)</div>
            </div>
            {/* Stat 3 */}
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-3">
                <Counter end={5284} suffix="+" duration={2500} />
              </div>
              <div className="text-gray-400 text-sm md:text-base">Transactions</div>
            </div>
            {/* Stat 4 */}
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-3">
                <Counter end={98} suffix="%" duration={2500} />
              </div>
              <div className="text-gray-400 text-sm md:text-base">Uptime SLA</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TrustedBy;
