import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Calendar, FileText, CheckCircle, Target, Lightbulb } from 'lucide-react';

export default function HomePage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        className="relative py-20 md:py-32 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10"
        style={{
          backgroundImage: 'url(/assets/generated/hero-bg.dim_1200x600.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground">
              Welcome to <span className="text-primary">Cognify</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              From Rote to Reason
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              At Cognify, we believe education is not about memorizing — it is about understanding. Our mission is to
              build strong concepts, logical thinking, and confidence in every student.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {!isAuthenticated ? (
                <>
                  <Link to="/register">
                    <Button size="lg" className="w-full sm:w-auto">
                      Register Now
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </>
              ) : (
                <Link to="/courses">
                  <Button size="lg" className="w-full sm:w-auto">
                    View Courses
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Why Choose Cognify?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We guide students from Rote Learning → Reason-Based Learning
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Small Batches</CardTitle>
                <CardDescription>Personal attention for every student with limited batch sizes</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Concept Clarity</CardTitle>
                <CardDescription>Deep understanding of subjects through concept-based teaching</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Regular Tests</CardTitle>
                <CardDescription>Weekly tests and performance tracking to monitor progress</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Attendance Tracking</CardTitle>
                <CardDescription>Monitor attendance and ensure consistent learning</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Complete NCERT Coverage</CardTitle>
                <CardDescription>Comprehensive coverage of NCERT syllabus for board preparation</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Affordable Education</CardTitle>
                <CardDescription>Quality education accessible to all students</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Teaching Method Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Our Teaching Method</h2>
              <p className="text-muted-foreground text-lg">
                We don't teach students what to think, we teach them how to think
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {['Concept', 'Practice', 'Application', 'Confidence'].map((step, index) => (
                <div key={step} className="text-center">
                  <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step}</h3>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-primary/30"></div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 p-8 bg-card rounded-lg border-2 border-primary/20">
              <h3 className="text-2xl font-display font-bold mb-6 text-center">Our Mission</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Understand instead of memorize</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Question instead of copy</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Apply instead of repeat</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-display font-bold">Ready to Start Your Journey?</h2>
              <p className="text-lg text-muted-foreground">
                Join Cognify today and experience education that builds understanding, not just memory.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Register Now
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">Admissions Open – Limited Seats Only</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
