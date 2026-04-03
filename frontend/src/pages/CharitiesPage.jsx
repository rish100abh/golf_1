import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

// UI components
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Search, Heart } from "lucide-react";

// ✅ Stripe
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CharitiesPage = () => {
  const navigate = useNavigate();

  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharities();
  }, [search]);

  const fetchCharities = async () => {
    try {
      const params = search.trim().length > 0 ? { search } : {};
      const response = await api.get("/charities", { params });
      setCharities(response.data || []);
    } catch (error) {
      console.error("Error fetching charities:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Stripe Donate Function
  const handleDonate = async (amount = 500) => {
    try {
      const stripe = await stripePromise;

      const res = await fetch(
        "http://localhost:5000/api/payment/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount }),
        }
      );

      const data = await res.json();

      if (!data.id) {
        throw new Error("No session ID returned");
      }

      await stripe.redirectToCheckout({
        sessionId: data.id,
      });
    } catch (error) {
      console.error("Stripe error:", error);
      alert("Payment failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between">
          <h1 className="text-2xl">Our Charities</h1>

          <Button onClick={() => navigate("/")}>Back</Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

          <Input
            placeholder="Search charities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : charities.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">
            No charities found
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map((charity) => (
              <Card key={charity.id}>
                <CardHeader>
                  <CardTitle className="flex gap-2 items-center">
                    <Heart className="w-5 h-5 text-accent" />
                    {charity.name}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm mb-2">{charity.category}</p>

                  <p className="text-sm text-muted-foreground mb-4">
                    {charity.description}
                  </p>

                  {charity.website && (
                    <a
                      href={charity.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-sm"
                    >
                      Visit →
                    </a>
                  )}

                  {/* ✅ Donate Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleDonate(100)}
                      className="w-full"
                      variant="outline"
                    >
                      ₹100
                    </Button>

                    <Button
                      onClick={() => handleDonate(500)}
                      className="w-full"
                    >
                      ₹500
                    </Button>

                    <Button
                      onClick={() => handleDonate(1000)}
                      className="w-full"
                      variant="secondary"
                    >
                      ₹1000
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharitiesPage;