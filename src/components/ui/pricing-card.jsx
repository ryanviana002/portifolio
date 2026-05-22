import { CheckCircle2, ArrowRight, Zap } from 'lucide-react';

const WA_BASE = "https://wa.me/5519994175385?text=";

const PricingCard = ({
  planName,
  price,
  priceNote,
  description,
  features,
  ctaText,
  isFeatured = false,
  isMonthly = false,
  waMessage,
}) => {
  const href = WA_BASE + encodeURIComponent(waMessage || `Olá Ryan! Tenho interesse no Plano ${planName}.`);

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '36px 32px',
      borderRadius: '20px',
      border: isFeatured ? '1px solid rgba(171,199,255,0.35)' : '1px solid rgba(255,255,255,0.06)',
      background: isFeatured
        ? 'linear-gradient(145deg, rgba(22,44,109,0.6) 0%, rgba(10,16,29,0.8) 100%)'
        : 'rgba(30,30,30,0.4)',
      backdropFilter: 'blur(12px)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      boxShadow: isFeatured
        ? '0 0 40px rgba(171,199,255,0.08), 0 20px 60px rgba(0,0,0,0.5)'
        : '0 8px 32px rgba(0,0,0,0.3)',
      transform: isFeatured ? 'scale(1.04)' : 'scale(1)',
    }}>
      {/* Badge "Mais Popular" */}
      {isFeatured && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(90deg, #abc7ff, #00D1FF)',
          borderRadius: '9999px',
          padding: '4px 16px',
          fontSize: '10px',
          fontWeight: 800,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#0a101d',
          whiteSpace: 'nowrap',
          fontFamily: 'Space Grotesk, sans-serif',
        }}>
          Mais Escolhido
        </div>
      )}

      <div style={{ flexGrow: 1 }}>
        {/* Nome do plano */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          {isFeatured && <Zap size={16} style={{ color: '#abc7ff' }} />}
          <h3 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '18px',
            fontWeight: 700,
            color: isFeatured ? '#abc7ff' : '#efece6',
            letterSpacing: '-0.01em',
          }}>{planName}</h3>
        </div>

        {/* Descrição */}
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '13px',
          color: 'rgba(191,188,183,0.6)',
          lineHeight: 1.5,
          marginBottom: '24px',
        }}>{description}</p>

        {/* Preço */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              color: 'rgba(191,188,183,0.5)',
              marginBottom: '8px',
            }}>R$</span>
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: price === 'Consulta' ? '36px' : '48px',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              background: isFeatured
                ? 'linear-gradient(90deg, #abc7ff, #00D1FF)'
                : 'linear-gradient(180deg, #efece6 0%, rgba(239,236,230,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{price}</span>
            {isMonthly && (
              <span style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '14px',
                color: 'rgba(191,188,183,0.4)',
                marginBottom: '6px',
              }}>/mês</span>
            )}
          </div>
          {priceNote && (
            <p style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '11px',
              color: 'rgba(191,188,183,0.4)',
              marginTop: '4px',
            }}>{priceNote}</p>
          )}
        </div>

        {/* Divisor */}
        <div style={{
          height: '1px',
          background: isFeatured ? 'rgba(171,199,255,0.12)' : 'rgba(255,255,255,0.05)',
          marginBottom: '24px',
        }} />

        {/* Features */}
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {features.map((feature, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2
                size={16}
                style={{
                  flexShrink: 0,
                  marginTop: '2px',
                  color: isFeatured ? '#abc7ff' : 'rgba(100,220,255,0.7)',
                }}
              />
              <span style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '13px',
                color: 'rgba(191,188,183,0.75)',
                lineHeight: 1.4,
              }}>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div style={{ marginTop: '32px' }}>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '14px 20px',
            borderRadius: '12px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            gap: '8px',
            transition: 'all 0.25s ease',
            ...(isFeatured ? {
              background: 'linear-gradient(135deg, #abc7ff, #00D1FF)',
              color: '#0a101d',
              boxShadow: '0 8px 24px rgba(171,199,255,0.25)',
            } : {
              background: 'rgba(255,255,255,0.05)',
              color: '#efece6',
              border: '1px solid rgba(255,255,255,0.1)',
            }),
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.opacity = '1';
          }}
        >
          {ctaText}
          <ArrowRight size={15} />
        </a>
      </div>
    </div>
  );
};

// Planos reais do RDCreator
export const RDC_PLANS = [
  {
    planName: "Básico",
    price: "697",
    priceNote: "Pagamento único · Sem mensalidades",
    description: "Para quem quer começar do jeito certo com um site profissional.",
    features: [
      "Site one page moderno e responsivo",
      "Até 6 seções completas",
      "Botão de direcionamento ao WhatsApp",
      "Galeria de fotos",
      "Mapa do Google integrado",
      "Estrutura clara e objetiva",
      "Informações do negócio",
      "Entrega em até 5 dias úteis",
      "Ideal para quem está começando",
    ],
    ctaText: "Para começar do jeito certo",
    waMessage: "Olá Ryan! Tenho interesse no Plano Básico (R$697). Pode me passar mais detalhes?",
  },
  {
    planName: "Padrão",
    price: "1.197",
    priceNote: "Pagamento único · Sem mensalidades",
    description: "Mais clientes e mais autoridade!",
    features: [
      "Inclui todos os recursos do plano Básico",
      "Até 3 páginas estruturadas",
      "Otimização para aparecer no Google (SEO básico)",
      "Animações nas seções",
      "Domínio + hospedagem",
      "Entrega em 12 dias úteis",
      "Ideal para a maioria das empresas",
      "Presença profissional online",
    ],
    ctaText: "Mais clientes e mais autoridade!",
    isFeatured: true,
    waMessage: "Olá Ryan! Tenho interesse no Plano Padrão (R$1.197). Pode me passar mais detalhes?",
  },
  {
    planName: "Premium",
    price: "1.597",
    priceNote: "Pagamento único · Sem mensalidades",
    description: "Site que vende por você!",
    features: [
      "Inclui todos os recursos do plano Padrão",
      "Até 5 páginas completas",
      "Copywriting estratégico",
      "Organização pensada para conversão",
      "Design premium personalizado",
      "Estrutura pensada para transformar visitantes em clientes",
    ],
    ctaText: "Site que vende por você!",
    waMessage: "Olá Ryan! Tenho interesse no Plano Premium (R$1.597). Pode me passar mais detalhes?",
  },
  {
    planName: "Gestão GMN",
    price: "349",
    priceNote: "Recorrente · Mensalidade",
    description: "Seu Google Meu Negócio gerenciado para atrair mais clientes locais todo mês.",
    features: [
      "Otimização contínua do perfil no Google",
      "Postagens semanais no GMN",
      "Resposta a avaliações dos clientes",
      "Relatório mensal de visibilidade",
      "Estratégia de palavras-chave local",
      "Monitoramento de concorrentes",
    ],
    ctaText: "Quero mais clientes no Google",
    isMonthly: true,
    waMessage: "Olá Ryan! Tenho interesse na Gestão do Google Meu Negócio (R$349/mês). Pode me passar mais detalhes?",
  },
];

export default function PricingSection() {
  return (
    <section style={{
      padding: '80px 24px',
      background: '#0a0a12',
      fontFamily: 'Space Grotesk, sans-serif',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            padding: '4px 14px',
            fontSize: '10px',
            letterSpacing: '0.15em',
            color: 'rgba(100,220,255,0.8)',
            marginBottom: '20px',
            textTransform: 'uppercase',
          }}>
            Planos e Preços
          </div>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#efece6',
            lineHeight: 1.1,
            marginBottom: '16px',
          }}>
            Escolha o plano certo<br/>
            <span style={{
              background: 'linear-gradient(90deg, #abc7ff, #00D1FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>para o seu negócio</span>
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'rgba(191,188,183,0.6)',
            maxWidth: '480px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Pagamento único. Sem mensalidades. Entregamos o site pronto para vender.
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'center',
        }}>
          {RDC_PLANS.map((plan, i) => (
            <PricingCard key={i} {...plan} />
          ))}
        </div>

        {/* Rodapé */}
        <p style={{
          textAlign: 'center',
          marginTop: '40px',
          fontSize: '12px',
          color: 'rgba(191,188,183,0.35)',
          letterSpacing: '0.02em',
        }}>
          * Pagamento único · Sem mensalidades · Diagnóstico gratuito incluído
        </p>
      </div>
    </section>
  );
}
