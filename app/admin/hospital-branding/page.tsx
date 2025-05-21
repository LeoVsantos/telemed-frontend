"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useHospitalTheme } from "@/components/hospital-theme-provider"
import { HospitalPreview } from "@/components/hospital-preview"

export default function HospitalBranding() {
  const { theme, setTheme } = useHospitalTheme()
  const [formData, setFormData] = useState({
    name: theme.name,
    logo: theme.logo,
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    accentColor: theme.accentColor,
    domain: theme.domain || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTheme(formData)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Hospital Branding Configuration</h1>

      <Tabs defaultValue="edit">
        <TabsList className="mb-6">
          <TabsTrigger value="edit">Edit Branding</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hospital Information</CardTitle>
                <CardDescription>Configure the hospital's branding information</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Hospital Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input
                      id="logo"
                      name="logo"
                      value={formData.logo}
                      onChange={handleChange}
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-muted-foreground">Enter the URL of the hospital's logo image</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domain">Custom Domain (Optional)</Label>
                    <Input
                      id="domain"
                      name="domain"
                      value={formData.domain}
                      onChange={handleChange}
                      placeholder="hospital.example.com"
                    />
                    <p className="text-xs text-muted-foreground">Enter a custom domain for this hospital</p>
                  </div>
                </CardContent>

                <CardHeader>
                  <CardTitle>Brand Colors</CardTitle>
                  <CardDescription>Configure the hospital's brand colors</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="primaryColor"
                          name="primaryColor"
                          type="color"
                          value={formData.primaryColor}
                          onChange={handleChange}
                          className="h-10 w-10 cursor-pointer p-1"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={handleChange}
                          name="primaryColor"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="secondaryColor"
                          name="secondaryColor"
                          type="color"
                          value={formData.secondaryColor}
                          onChange={handleChange}
                          className="h-10 w-10 cursor-pointer p-1"
                        />
                        <Input
                          value={formData.secondaryColor}
                          onChange={handleChange}
                          name="secondaryColor"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accentColor">Accent Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="accentColor"
                          name="accentColor"
                          type="color"
                          value={formData.accentColor}
                          onChange={handleChange}
                          className="h-10 w-10 cursor-pointer p-1"
                        />
                        <Input
                          value={formData.accentColor}
                          onChange={handleChange}
                          name="accentColor"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button type="submit" className="ml-auto">
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See how your branding changes will look</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <HospitalPreview
                    previewTheme={{
                      name: formData.name,
                      logo: formData.logo,
                      primaryColor: formData.primaryColor,
                      secondaryColor: formData.secondaryColor,
                      accentColor: formData.accentColor,
                      domain: formData.domain,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Full Preview</CardTitle>
              <CardDescription>Preview how the hospital branding will appear across the platform</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <iframe src="/" className="h-[600px] w-full rounded-md border" title="Hospital Preview" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
