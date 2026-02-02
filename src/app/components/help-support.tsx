"use client";

import { useEffect, useState } from "react";
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  Book,
  Video,
  FileText,
  Send,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";
import { supportApi } from "../utils/api-service"; // <-- Add this import

const quickLinks = [
  {
    title: "Getting Started",
    description: "Learn how to set up your account and start using the dashboard.",
    icon: Book,
    bgColor: "bg-blue-100",
    color: "text-blue-600",
    href: "#"
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step guides on using key features.",
    icon: Video,
    bgColor: "bg-green-100",
    color: "text-green-600",
    href: "#"
  },
  {
    title: "Documentation",
    description: "Read detailed documentation for advanced usage.",
    icon: FileText,
    bgColor: "bg-purple-100",
    color: "text-purple-600",
    href: "#"
  }
];

export function HelpSupport() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // API state
  const [faqs, setFaqs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [contactMethods, setContactMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supportApi.getFaqs().then((data) => {
      setFaqs(data.faqs || []);
      setCategories(data.categories || []);
      setContactMethods(data.contactMethods || []);
    }).finally(() => setLoading(false));
  }, []);

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  if (loading) return <div>Loading support info...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="font-bold text-foreground text-3xl">Help & Support</h1>
        <p className="text-muted-foreground mt-2">
          Find answers to your questions or get in touch with our support team
        </p>
      </div>

      {/* Search Bar */}
      <Card className="p-4 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for help articles, guides, FAQs..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Card key={link.title} className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className={cn("p-3 rounded-lg", link.bgColor)}>
                  <Icon className={cn("w-6 h-6", link.color)} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                  <div className="flex items-center gap-1 mt-3 text-primary text-sm">
                    <span>Learn more</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Filter */}
        <div>
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-4">Categories</h3>
            <div className="space-y-1">
              {categories.map((category: any) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <span className="text-sm font-medium">{category.label}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      selectedCategory === category.id
                        ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"
                        : "bg-muted"
                    )}
                  >
                    {category.count}
                  </Badge>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* FAQ List */}
        <div className="lg:col-span-3 space-y-3">
          {filteredFaqs.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No FAQs found matching your search.</p>
            </Card>
          ) : (
            filteredFaqs.map((faq: any) => {
              const isExpanded = expandedFaq === faq.id;
              return (
                <Card key={faq.id} className="overflow-hidden">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <HelpCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="font-medium text-foreground">{faq.question}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="pl-8 pr-8">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Contact Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-foreground text-xl">Send us a Message</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Can't find what you're looking for? Contact our support team
              </p>
            </div>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Subject
                  </label>
                  <Input placeholder="Brief description of your issue" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Category
                  </label>
                  <select className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm">
                    <option>General Inquiry</option>
                    <option>Technical Issue</option>
                    <option>Commission Question</option>
                    <option>Lead Management</option>
                    <option>Payment Issue</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Message
                </label>
                <Textarea
                  placeholder="Describe your issue or question in detail..."
                  rows={6}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button className="gap-2">
                  <Send className="w-4 h-4" />
                  Send Message
                </Button>
                <p className="text-xs text-muted-foreground">
                  We typically respond within 24 hours
                </p>
              </div>
            </form>
          </Card>
        </div>

        {/* Contact Methods */}
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Contact Methods</h3>
            <div className="space-y-4">
              {contactMethods.map((contact: any) => {
                const Icon = contact.icon;
                return (
                  <div key={contact.method} className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg", contact.bgColor)}>
                      <Icon className={cn("w-5 h-5", contact.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{contact.method}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{contact.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Response: {contact.responseTime}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 bg-accent/5 border-accent/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground text-sm">Support Hours</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Monday - Friday: 9:00 AM - 6:00 PM WAT
                </p>
                <p className="text-sm text-muted-foreground">
                  Saturday: 10:00 AM - 2:00 PM WAT
                </p>
                <p className="text-sm text-muted-foreground">
                  Sunday: Closed
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
