import { useEffect, useState, type ReactElement } from 'react';
import { Scissors, Droplets, PawPrint, Clock, ChevronDown } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

type GroomerProfileSummary = {
  display_name?: string | null;
};

type ApiService = {
  id: string;
  groomer_profile_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  groomer_profile?: GroomerProfileSummary;
};

const iconByName: Record<string, ReactElement> = {
  wash: <Droplets size={48} />,
  'bath & brush': <Droplets size={48} />,
  grooming: <Scissors size={48} />,
  tunsoare: <Scissors size={48} />,
  'nail trim': <PawPrint size={48} />,
};

const cardBackgrounds = ['#FDE8F3', '#F0FDF4', '#FFFFFF'];

const getServiceIcon = (serviceName: string) => {
  const normalized = serviceName.trim().toLowerCase();
  return iconByName[normalized] ?? <PawPrint size={48} />;
};

const getCardBackground = (index: number) => cardBackgrounds[index % cardBackgrounds.length];

const faqs = [
  {
    question: 'How long does a full groom take?',
    answer: 'A full groom typically takes 90 minutes, but can vary depending on your dog\'s size, coat type, and temperament. We never rush — your pup gets all the time they need.'
  },
  {
    question: 'Do I need to book in advance?',
    answer: 'We recommend booking at least 3-5 days in advance, especially for weekends. However, we often have same-day or next-day availability for certain groomers and services.'
  },
  {
    question: 'What if my dog is anxious?',
    answer: 'We specialize in anxious dogs! Many of our groomers are trained in low-stress handling techniques. Let us know during booking, and we\'ll match you with a groomer who excels with nervous pups.'
  },
  {
    question: 'Can I stay during the grooming?',
    answer: 'While we appreciate the desire to stay close, most dogs actually do better when their owners aren\'t present. We\'ll send you updates and photos during the session!'
  },
  {
    question: 'What if I need to cancel?',
    answer: 'We offer free cancellation up to 24 hours before your appointment. Cancellations within 24 hours may incur a $20 fee to compensate the groomer.'
  },
  {
    question: 'Do you groom cats?',
    answer: 'Currently, we only groom dogs. We focus exclusively on canine grooming to ensure we provide the highest quality service possible.'
  }
];

export function ServicesPage() {
  const [services, setServices] = useState<ApiService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/services');
        if (!response.ok) {
          setServicesError(`Failed to load services (HTTP ${response.status})`);
          return;
        }

        const data: ApiService[] = await response.json();
        if (!isMounted) {
          return;
        }

        const activeServices = (Array.isArray(data) ? data : []).filter(service => service.is_active);
        setServices(activeServices);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Failed to load services.';
        setServicesError(message);
      } finally {
        if (isMounted) {
          setLoadingServices(false);
        }
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="mb-4" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '48px'
          }}>
            Everything Your Pup Needs
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '18px' }}>
            From quick trims to full spa days - we have got every coat covered.
          </p>
        </div>

        {/* Services Grid */}
        {loadingServices ? (
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {[1, 2, 3].map(item => (
              <Card key={item} className="p-8 animate-pulse">
                <div className="h-10 w-10 rounded bg-gray-200 mb-4 mx-auto" />
                <div className="h-6 bg-gray-200 rounded mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-3 w-2/3 mx-auto" />
                <div className="h-5 bg-gray-200 rounded mb-4 w-1/3 mx-auto" />
                <div className="h-14 bg-gray-200 rounded" />
              </Card>
            ))}
          </div>
        ) : servicesError ? (
          <Card className="mb-20 p-6 text-center">
            <p className="font-bold" style={{ color: 'var(--color-danger, #dc2626)' }}>
              Could not load services.
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {servicesError}
            </p>
          </Card>
        ) : services.length === 0 ? (
          <Card className="mb-20 p-6 text-center">
            <p className="font-bold">No active services available right now.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {services.map((service, index) => (
              <Card key={service.id} className="overflow-hidden" hover>
                <div className="p-8 flex flex-col items-center text-center" style={{ backgroundColor: getCardBackground(index) }}>
                  <div className="mb-4" style={{ color: 'var(--color-primary)' }}>
                    {getServiceIcon(service.name)}
                  </div>
                  <h3 className="font-extrabold mb-2" style={{ fontSize: '20px' }}>
                    {service.name}
                  </h3>
                  <Badge variant="primary" className="text-xs mb-3">
                    <Clock size={12} className="mr-1" />
                    {service.duration_minutes} min
                  </Badge>
                  <div className="font-extrabold mb-1" style={{ color: 'var(--color-primary)', fontSize: '24px' }}>
                    From ${service.price}
                  </div>
                  {service.groomer_profile?.display_name && (
                    <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                      Groomer: {service.groomer_profile.display_name}
                    </p>
                  )}
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {service.description || 'No description provided yet.'}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center font-extrabold mb-8" style={{ fontSize: '32px', fontFamily: 'var(--font-heading)' }}>
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Card key={i} className="overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-[var(--color-primary-light)] transition-colors"
                >
                  <span className="font-bold pr-4">{faq.question}</span>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--color-primary)' }}
                  />
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-6 border-l-4" style={{ borderColor: 'var(--color-accent)' }}>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
