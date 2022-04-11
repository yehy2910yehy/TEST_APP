using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace MODELS
{
    public enum SubscribtionState {  credentials, localite, phone, pass,done }
    public enum RightsAccess { none = 0, Level_1 = 1, Manager = 2,Administrator = 3 }

    public enum TerminalType { Mail, Sms, Push }

    public class UserPostModel
    {
        public string Prenom { get; set; }
        public string Nom { get; set; }
        public string Mail { get; set; }
        public RightsAccess? Role { get; set; }


    }

    public class UserStateModel
    {
        public string Prenom { get; set; }
        public string Nom { get; set; }
        public string Mail { get; set; }
        public RightsAccess? Role { get; set; }

    }





    public class UserReturnModel
    {
        public SubscribtionState State { get; set; }
        public object ID { get; set; }
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public string Mail { get; set; }
        public bool MailConfirmed { get; set; }
        public RightsAccess? Role { get; set; }
        public bool Activated { get; set; }
        public bool DoubleAuth { get; set; }
        public TerminalType AuthTerminal { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string CreatedBy { get; set; }
    }



}