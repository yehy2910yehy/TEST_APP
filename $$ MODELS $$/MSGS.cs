using System;

namespace MODELS
{
    public static class MSGS
    {
        // log
        public const string logNotFound = "Dernière m-a-j introuvable, faites une m-a-j manuelle depuis PARAMS.=> AVANCÉS.. ";



        // mail
        public const string FileSent = "Fichier Envoyé";
        public const string MailSent = "Mail envoyé";


        //db
        public static string modelError(Type type) => $"Model:{type.Name} incompatile!";
        public const string noUpdateError = "Aucun changement notifié";

        //IP
        public const string ipError = "Adresse IP non autorisé.";



        // network
        public const string isInService = "est en service.";
        public const string isConnected = "est connecté(e).";
        public const string isOutService = "est hors service.";
        public const string isDisConnected = "est déconnecté(e).";




        public const string rejectedAuthorized = "Autorisation annulée ou refusée.";
        public const string notAuthorized = "Non authorisé.";
        public const string mobileNotRegistred = "Smartphone introuvable.";
        public const string emptyError = "Requete vide.";
        public const string argError = "Argument(s) manquant(s).";
        public const string tooShortError = "Champs trop court.";
        public const string tooLongError = "Champs trop long.";
        public const string mailError = "Adresse mail non valide.";
        public const string requiredError = "Champs incomplet.";


        // opp
        public const string oppOk = "Opperation reussi.";
        public const string noModif = "Aucune modification apporté.";
        public const string oppUpdated = "Mis-à-jour reussi.";
        public const string oppFailedError = "Opperation échouée.";
        public const string NotFoundError = "Elément introuvable!.";
        public const string RoleLowError = "Niveau d'habilitation insuffisant";


        // auth
        public const string ReiniError = "Erreur de reinitialisation.";
        public const string ReiniPass = "Le M-D-P a été reinitialiser.";
        public const string HasPassError = "Le M-D-P n'a pas été reinitialisé.";
        public const string DefinePassOk = "Le M-D-P a bien été reinitialiser.";

        // double auth 
        public const string RequestCodeSentTo = "Un code d'authentification a été envoyé à:";
        public const string SendCodeTitle = "DOUBLE AUTHENTIFICATION";
        public const string SendCodeBody = "Ce code d'authentification a été émis pour valider votre opération.";
        public const string IsWaitinAlready = "Requête déja en attente";
        public const string Format = "chaîne mal formater";





        // account
        public const string ExistAlreadyError = "Elément déjà existant.";
        public const string PassNotSet = "Mot de passe non enregitré";
        public const string PassExist = "Mot de passe déjà enregistrée, contacter l'administrateur.";
        public const string AccountLocked = "Compte bloqué, contacter l'administrateur.";
        public const string UserNotFound = "Utilisateur introuvable.";
        public const string PassNotValid = "Mot de passe non valide.";

        //mairie
        public const string MairieNameError = "Commune ou departement mal formaté!";
        public const string MairieExistAlready = "Commune déjà inscrite.";


        // string validation
        public const string Required = " est Incomplet.";
        public const string Short = " est trop court.";
        public const string Long = " est trop long.";
        public const string Mail = "Adresse mail invalide.";
        public const string Role = "Role à définir, ou invalide";
      


        // auth /account validation
        public const string MailExist = "Adresse mail déjà enregistée!";
        public const string NotValid = "Paramètres non valides !";
        public const string UserNotValid = "Login ou mot de passe invalides!";
        public const string UserDoesntExist = "Utilisateur introuvable!";
        public const string AccountDoesntExist = "Compte inexistant!";
        public const string mairieNotCorrespondingError = "Utilisateur introuvable pour cette mairie. ";


        // route 
        public const string NotAuth = "Vous n'êtes pas authentifié!";
        public const string RightsNotsufficient = "Vous ne disposez pas des droits nécessaires!";
        public const string PageNotFound = "Page inéxistante ou introuvable.";


        //phone
      
        public const string notRegistred = "Appareil non enregistré";


        public const string FolderNotFound = "Dossier introuvable.";
        public const string FileNotFound = "Fichier introuvable.";


        // pc

        public const string PCNotFound = "Pc introuvable.";
        public static string PcAlreadyRegistred(string name) => $"Poste déjà enregistré, se désinscrire ou contacter GestActe.";
        public static string PcNotRegistred(string name) => $"Aucun poste n'est enregistré pour: {name}.";
        public static string PcNotCorresponding(string name) => $"{name} ne corespond pas au poste enregistré.";


        public static void Validate(this object obj, string err = null)
        {
            string msg = err ?? NotFoundError;

            if (obj == null)
                throw new Exception(msg);

            if (obj.GetType() == typeof(string))
            {
                var val = obj.ToString();
                if (string.IsNullOrEmpty(val))
                    throw new Exception(msg);
            }
     
        }

      
    


    }
}
