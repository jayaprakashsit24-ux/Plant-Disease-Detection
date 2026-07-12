import React from "react";
import { ExternalLink, BookOpen, Globe, Award } from "lucide-react";

export const GuidelineLinks: React.FC = () => {
  const links = [
    {
      title: "FAO Plant Production and Protection Division",
      description: "Official United Nations agency promoting sustainable plant protection and crop productivity.",
      url: "https://www.fao.org/agriculture/plant-production-and-protection/en/",
      category: "Global Standards",
      icon: Globe,
    },
    {
      title: "CABI Plantwise Knowledge Bank",
      description: "Comprehensive scientific database for crop health, disease diagnosis, and treatment recommendations.",
      url: "https://www.plantwise.org/KnowledgeBank/",
      category: "Scientific Research",
      icon: BookOpen,
    },
    {
      title: "EPPO Global Database",
      description: "European and Mediterranean Plant Protection Organization database containing pest species and quarantines.",
      url: "https://gd.eppo.int/",
      category: "Pest Management",
      icon: Award,
    },
    {
      title: "USDA Agricultural Research Service (ARS)",
      description: "Scientific publications and crop pest identification guides by the US Department of Agriculture.",
      url: "https://www.ars.usda.gov/",
      category: "National Extensions",
      icon: Globe,
    }
  ];

  return (
    <div id="guideline-links-panel" className="bg-white border border-editorial-dark/10 p-6">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-editorial-dark/5">
        <div className="bg-editorial-bg text-editorial-green p-2 border border-editorial-dark/15">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif italic text-editorial-dark text-lg">Official Agricultural Extension Resources</h3>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Access peer-reviewed botanical advice and regulatory plant health standards</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.title}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 border border-editorial-dark/5 hover:border-editorial-green hover:bg-editorial-bg/35 transition-all duration-200 group"
            >
              <div className="bg-editorial-bg group-hover:bg-white text-gray-400 group-hover:text-editorial-green p-2 border border-editorial-dark/5 transition-colors duration-200 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-editorial-green bg-white border border-editorial-green/15 px-1.5 py-0.5">
                    {link.category}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-editorial-green transition-colors" />
                </div>
                <h4 className="font-serif italic text-sm text-editorial-dark group-hover:text-editorial-green mt-1 transition-colors">
                  {link.title}
                </h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed font-sans">
                  {link.description}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
