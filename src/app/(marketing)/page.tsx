import { Background, Companies, Container, CTA, Hero, Perks, Pricing, Reviews, Wrapper } from "@/components";
import { Spotlight } from "@/components/ui/spotlight";


const HomePage = () => {
    return (
        <Background>
            <Wrapper className="py-20 relative">
                <Container className="relative">
                    <Spotlight
                        className="-top-40 left-0 md:left-60 md:-top-20"
                        fill="rgba(255, 255, 255, 0.5)"
                    />
                </Container>
            </Wrapper>
            {/* Hero section outside wrapper for full width */}
            <div className="relative -mt-20 mb-0">
                <Hero />
            </div>
            <Wrapper>
                <Container className="py-0">
                    <Companies />
                </Container>
                <Perks />
                <Pricing />
                <Reviews />
                <CTA />
            </Wrapper>
        </Background>
    )
};

export default HomePage
