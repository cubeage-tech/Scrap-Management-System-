import Hero from '../../components/home/Hero'
import TrustedBy from '../../components/home/TrustedBy'
import Features from '../../components/home/Features'
import Process from '../../components/home/Process'
import Roles from '../../components/home/Roles'
import Testimonials from '../../components/home/Testimonials'
import Enterprise from '../../components/home/Enterprise'
import CTA from '../../components/home/CTA'

const Home = () => {
  return (
    <div>
      <Hero />
      <TrustedBy />
      <Features />
      <Process />
      <Roles />
      <Testimonials />
      <Enterprise />
      <CTA />
      {/* Footer will be handled by the other team */}
    </div>
  )
}

export default Home

