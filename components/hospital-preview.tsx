"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

type HospitalTheme = {
  name: string
  logo: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  domain?: string
}

export function HospitalPreview({
  previewTheme,
}: {
  previewTheme: HospitalTheme
}) {
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center space-x-2">
        <div className="h-10 w-auto">
          <Image
            src={previewTheme.logo || "/placeholder.svg"}
            alt={`${previewTheme.name} Logo`}
            width={120}
            height={30}
            className="h-full w-auto"
          />
        </div>
        <span className="text-lg font-medium">{previewTheme.name}</span>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full" style={{ backgroundColor: previewTheme.primaryColor }}></div>
            <span>Primary Color</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full" style={{ backgroundColor: previewTheme.secondaryColor }}></div>
            <span>Secondary Color</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full" style={{ backgroundColor: previewTheme.accentColor }}></div>
            <span>Accent Color</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>UI Preview</CardTitle>
            <CardDescription>Sample UI elements with your branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">Buttons</span>
              <div className="flex flex-wrap gap-2">
                <Button style={{ backgroundColor: previewTheme.primaryColor }} className="text-white hover:opacity-90">
                  Primary Button
                </Button>
                <Button
                  style={{ backgroundColor: previewTheme.secondaryColor }}
                  className="text-white hover:opacity-90"
                >
                  Secondary Button
                </Button>
                <Button variant="outline">Outline Button</Button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Card with Branding</span>
              <Card>
                <CardHeader style={{ backgroundColor: previewTheme.accentColor, opacity: 0.1 }}>
                  <CardTitle>{previewTheme.name}</CardTitle>
                  <CardDescription>Sample card with your branding</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <p>This is how content will appear in cards throughout the application.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button
                    style={{ backgroundColor: previewTheme.primaryColor }}
                    className="text-white hover:opacity-90"
                  >
                    Continue
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>

        {previewTheme.domain && (
          <div className="rounded-md border p-4">
            <h3 className="mb-2 text-sm font-medium">Custom Domain</h3>
            <p className="text-sm">
              Your telemedicine platform will be accessible at:{" "}
              <span className="font-medium">{previewTheme.domain}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
