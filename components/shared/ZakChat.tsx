"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ZakChat() {
  const [inputValue, setInputValue] = useState("");

  return (
    <Card className="w-full flex flex-col max-h-screen h-[540px] rounded-xl shadow-lg border border-border/60">
      <CardHeader className="border-b pb-4 shrink-0">
        <CardTitle className="text-base font-semibold tracking-tight">Zak</CardTitle>
        <CardDescription>
          Zak is an AI assistant designed to help you with your career goals.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4">
        {/* Messages display div */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-lg px-4 py-2 max-w-[85%] text-sm">
              Hi! I am Zak. How can I assist you with your career today?
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t shrink-0">
        <div className="flex w-full items-center gap-2">
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message for Zak..." 
            className="flex-1 rounded-lg"
          />
          <Button className="rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
            Send
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
