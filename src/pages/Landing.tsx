import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Calendar, 
  DollarSign, 
  Stethoscope, 
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Globe,
  Heart,
  Activity,
  TrendingUp,
  Lock,
  Smartphone,
  Cloud,
  Award,
  Play,
  ChevronDown,
  Sparkles,
  Target,
  Clock,
  BarChart3,
  Building2
} from 'lucide-react';
import { BRANDING } from '@/config/branding';

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Stethoscope,
      title: "Prontuário Eletrônico",
      description: "Prontuário completo com anamnese, exame físico, CID e prescrições",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Gestão completa de agendamentos com lembretes automáticos",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      icon: DollarSign,
      title: "Faturamento TISS",
      description: "Faturamento automático para convênios e particular",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      icon: Users,
      title: "Gestão de Pacientes",
      description: "Cadastro completo com histórico médico e visual",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      icon: Globe,
      title: "Telemedicina",
      description: "Consultas remotas integradas ao sistema",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600"
    },
    {
      icon: Lock,
      title: "LGPD Compliant",
      description: "Totalmente compatível com a Lei Geral de Proteção de Dados",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600"
    }
  ];

  const stats = [
    { number: "500+", label: "Clínicas Ativas", icon: Building2 },
    { number: "50K+", label: "Pacientes Atendidos", icon: Users },
    { number: "99.9%", label: "Uptime Garantido", icon: Activity },
    { number: "24/7", label: "Suporte Técnico", icon: Clock }
  ];

  const testimonials = [
    {
      name: "Dr. João Silva",
      clinic: "Clínica São Paulo",
      text: "O Prontivus revolucionou nossa clínica. A gestão ficou muito mais eficiente e nossos pacientes adoram o portal.",
      rating: 5
    },
    {
      name: "Dra. Maria Santos",
      clinic: "Clínica Rio de Janeiro",
      text: "Excelente sistema! Faturamento TISS automático e prontuário completo. Economizamos horas por dia.",
      rating: 5
    },
    {
      name: "Dr. Carlos Oliveira",
      clinic: "Clínica Belo Horizonte",
      text: "Suporte excepcional e sistema muito intuitivo. A migração foi tranquila e rápida. Recomendo!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative">
              <img 
                src={BRANDING.assets.logoTransparent} 
                alt={BRANDING.name}
                className="h-24 w-auto animate-pulse"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hidden">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="hover:bg-blue-50 transition-all duration-300">
                Entrar
              </Button>
            </Link>
            <Link to="/auth/register/patient">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                Cadastrar-se
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200 animate-bounce">
                <Sparkles className="w-4 h-4 mr-2" />
                Sistema Completo de Gestão Médica
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent leading-tight">
                Transforme sua clínica com{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
                  {BRANDING.name}
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Sistema completo de gestão médica com prontuário eletrônico, 
                agenda inteligente, faturamento TISS e muito mais. 
                <span className="font-semibold text-blue-600"> Desenvolvido para clínicas modernas.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                <Link to="/auth/register/patient">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                    Começar Agora
                    <ArrowRight className="w-5 h-5 ml-2 animate-pulse" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 border-2 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
                  <Play className="w-5 h-5 mr-2" />
                  Ver Demonstração
                </Button>
              </div>
            </div>

            {/* Right Column - Healthcare Images */}
            <div className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative">
                {/* Main Image */}
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="/Images/img (1).jpg" 
                    alt="Healthcare professionals using modern technology"
                    className="w-full h-80 object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                
                {/* Floating Images */}
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-xl overflow-hidden shadow-lg z-20">
                  <img 
                    src="/Images/img (2).jpg" 
                    alt="Medical consultation"
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-xl overflow-hidden shadow-lg z-20">
                  <img 
                    src="/Images/img (3).jpg" 
                    alt="Healthcare technology"
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-1/2 -left-8 w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-8 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="relative mt-20 text-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl animate-pulse"></div>
            </div>
            <div className="relative z-10 flex justify-center">
              <ChevronDown className="w-8 h-8 text-blue-600 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`text-center transform transition-all duration-700 delay-${index * 100} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mb-4 shadow-lg">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-5">
          <img 
            src="/Images/img (4).jpg" 
            alt="Healthcare background"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className={`text-center mb-16 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-medium border-blue-200 text-blue-700">
              <Target className="w-4 h-4 mr-2" />
              Funcionalidades
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Tudo que sua clínica precisa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Funcionalidades completas para gestão médica moderna e eficiente
            </p>
          </div>
          
          {/* Features Grid with Images */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`group hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm overflow-hidden ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Feature Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={`/Images/img (${index + 5}).jpg`}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className={`absolute top-4 right-4 w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center shadow-lg`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                </div>
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="w-full h-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${feature.color} rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000`}></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Healthcare Images Showcase */}
          <div className={`grid md:grid-cols-2 gap-8 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
              <img 
                src="/Images/img (9).jpg" 
                alt="Modern healthcare technology"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Tecnologia Avançada</h3>
                <p className="text-lg opacity-90">Soluções inovadoras para medicina moderna</p>
              </div>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
              <img 
                src="/Images/img (10).jpg" 
                alt="Healthcare professionals"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Equipe Especializada</h3>
                <p className="text-lg opacity-90">Profissionais dedicados ao seu sucesso</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-10">
          <img 
            src="/Images/img (6).jpg" 
            alt="Healthcare testimonials background"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className={`text-center mb-16 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-medium border-yellow-200 text-yellow-700">
              <Award className="w-4 h-4 mr-2" />
              Depoimentos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Confiado por clínicas em todo o Brasil
            </h2>
            <p className="text-xl text-gray-600">
              Veja o que nossos clientes dizem sobre o Prontivus
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className={`group hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-0 overflow-hidden ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {/* Testimonial Image */}
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={`/Images/img (${index + 7}).jpg`}
                    alt={`Testimonial from ${testimonial.name}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
                
                <CardContent className="pt-6 pb-8">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.clinic}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className={`transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-white/20 text-white border-white/30">
              <Heart className="w-4 h-4 mr-2" />
              Pronto para começar?
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para transformar sua clínica?
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Comece hoje mesmo e veja a diferença que o Prontivus pode fazer na sua clínica
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/auth/register/patient">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  Criar Conta Gratuita
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
                <Play className="w-5 h-5 mr-2" />
                Agendar Demonstração
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-2000"></div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 relative">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src={BRANDING.assets.logoTransparent} 
                  alt={BRANDING.name}
                  className="h-12 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hidden">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">{BRANDING.name}</span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Sistema completo de gestão médica para clínicas modernas. 
                Transforme sua prática médica com tecnologia de ponta.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors duration-300 cursor-pointer">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors duration-300 cursor-pointer">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors duration-300 cursor-pointer">
                  <Cloud className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Produto</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors duration-300">Funcionalidades</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors duration-300">Preços</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors duration-300">Demonstração</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors duration-300">Integrações</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Suporte</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors duration-300">Central de Ajuda</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors duration-300">Contato</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors duration-300">Status</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors duration-300">Comunidade</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              &copy; 2024 {BRANDING.name}. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-gray-400">
              <Link to="#" className="hover:text-white transition-colors duration-300">Termos de Uso</Link>
              <Link to="#" className="hover:text-white transition-colors duration-300">Privacidade</Link>
              <Link to="#" className="hover:text-white transition-colors duration-300">LGPD</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;