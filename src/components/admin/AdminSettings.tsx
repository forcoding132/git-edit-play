import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, Database, Mail, Shield } from "lucide-react";

interface AdminSettingsProps {
  onStatsUpdate: () => void;
}

export const AdminSettings = ({ onStatsUpdate }: AdminSettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    notificationEmail: "",
    siteName: "Nova Funded Traders",
    siteDescription: "Professional trading challenge platform",
    maxAccountSize: 100000,
    minTradingDays: 5,
  });
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    setLoading(true);
    
    // Simulate saving settings
    setTimeout(() => {
      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully.",
      });
      setLoading(false);
    }, 1000);
  };

  const handleDatabaseBackup = async () => {
    setLoading(true);
    
    // Simulate database backup
    setTimeout(() => {
      toast({
        title: "Backup Initiated",
        description: "Database backup has been started successfully.",
      });
      setLoading(false);
    }, 2000);
  };

  const handleTestEmail = async () => {
    setLoading(true);
    
    // Simulate email test
    setTimeout(() => {
      toast({
        title: "Test Email Sent",
        description: "A test email has been sent to the configured address.",
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>General Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="registrationEnabled"
                checked={settings.registrationEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
              />
              <Label htmlFor="registrationEnabled">Enable User Registration</Label>
            </div>
          </CardContent>
        </Card>

        {/* Trading Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Trading Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxAccountSize">Maximum Account Size ($)</Label>
              <Input
                id="maxAccountSize"
                type="number"
                value={settings.maxAccountSize}
                onChange={(e) => setSettings({ ...settings, maxAccountSize: parseInt(e.target.value) })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minTradingDays">Minimum Trading Days</Label>
              <Input
                id="minTradingDays"
                type="number"
                value={settings.minTradingDays}
                onChange={(e) => setSettings({ ...settings, minTradingDays: parseInt(e.target.value) })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notificationEmail">Notification Email</Label>
              <Input
                id="notificationEmail"
                type="email"
                value={settings.notificationEmail}
                onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                placeholder="admin@novafundedtraders.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>System Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Database Management</Label>
              <Button
                onClick={handleDatabaseBackup}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                <Database className="h-4 w-4 mr-2" />
                {loading ? "Creating Backup..." : "Create Database Backup"}
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>Email Testing</Label>
              <Button
                onClick={handleTestEmail}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                <Mail className="h-4 w-4 mr-2" />
                {loading ? "Sending..." : "Send Test Email"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Save Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSaveSettings}
              disabled={loading}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save All Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};