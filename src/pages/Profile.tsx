import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Shield,
  Key
} from "lucide-react"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const Profile = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    crm: '',
    specialty: '',
    bio: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const userData = await apiService.getCurrentUser();
      setUserInfo(userData);
      setFormData({
        full_name: userData.full_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        crm: userData.crm || '',
        specialty: userData.specialty || '',
        bio: userData.bio || ''
      });
    } catch (error) {
      console.error('Error loading user info:', error);
      toast.error('Erro ao carregar informações do usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // In a real app, you would call an API to update the profile
      toast.success('Perfil atualizado com sucesso!');
      setEditing(false);
      await loadUserInfo();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('As senhas não coincidem');
        return;
      }
      
      // In a real app, you would call an API to change the password
      toast.success('Senha alterada com sucesso!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Erro ao alterar senha');
    }
  };

  const getUserRole = (user: any) => {
    if (user?.crm) {
      return 'Médico';
    }
    if (user?.user_role === 'admin') {
      return 'Administrador';
    }
    if (user?.user_role === 'secretary') {
      return 'Secretária';
    }
    return 'Usuário';
  };

  const getUserRoleColor = (user: any) => {
    if (user?.crm) {
      return 'bg-blue-100 text-blue-800';
    }
    if (user?.user_role === 'admin') {
      return 'bg-red-100 text-red-800';
    }
    if (user?.user_role === 'secretary') {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Meu Perfil" subtitle="Gerencie suas informações pessoais">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{userInfo?.full_name || 'Usuário'}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getUserRoleColor(userInfo)}>
                      {getUserRole(userInfo)}
                    </Badge>
                    {userInfo?.crm && (
                      <Badge variant="outline">CRM: {userInfo.crm}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {!editing ? (
                  <Button onClick={() => setEditing(true)} className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Editar Perfil
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setEditing(false)} className="flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Salvar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!editing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!editing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!editing}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Informações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="crm">CRM</Label>
                <Input
                  id="crm"
                  value={formData.crm}
                  onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                  disabled={!editing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="specialty">Especialidade</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  disabled={!editing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!editing}
                  className="mt-1"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Senha</h4>
                <p className="text-sm text-muted-foreground">Altere sua senha para manter sua conta segura</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Alterar Senha
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password Change Modal */}
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Senha</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleChangePassword}>
                  Alterar Senha
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Profile;
