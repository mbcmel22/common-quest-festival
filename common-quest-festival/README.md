# Common Quest, site vitrine du festival

Site officiel du festival Common Quest, porte par le collectif PRISM.
Next.js 15 + Supabase + Vercel, en trois langues (francais, anglais, espagnol), avec un back office pour tout modifier sans toucher au code.

---

## 1. Ce que fait le site

**Cote public**
- Page d accueil : la question du festival en grand, le parcours des quatre journees, les temps forts.
- Page programme : filtres par journee et par discipline, cartes qui reagissent au survol.
- Page evenement : horaires, tarifs, lieu, tetes d affiche et bouton "je prends ma place" vers ta billetterie.
- Page infos : infos pratiques, equipe PRISM avec photos, partenaires.
- Trois langues avec un selecteur FR / EN / ES en haut a droite.
- Creation de compte, connexion, mot de passe oublie.
- Fleche de retour en haut de page, visible apres quelques defilements.
- Bandeau cookies, mentions legales, politique de confidentialite.

**Cote back office** (`/fr/admin`, reserve aux comptes administrateurs)
- Creer, modifier, publier ou depublier un evenement.
- Ecrire les textes dans les trois langues via des onglets.
- Envoyer les visuels des tetes d affiche depuis ton ordinateur.
- Coller le lien de billetterie de chaque evenement.
- Gerer les membres de l equipe : photo, prenom, surnom, role.
- Modifier les infos pratiques affichees sur la page infos.

---

## 2. Avant de commencer

A installer une seule fois sur ton ordinateur :
- **Node.js** version 20 ou plus, sur nodejs.org, bouton LTS.
- **Visual Studio Code**, l editeur de code, sur code.visualstudio.com.
- **Git**, sur git-scm.com.

Trois comptes gratuits a creer :
- **GitHub** pour heberger le code.
- **Vercel** pour publier le site.
- **Supabase** pour la base de donnees, les comptes et les images.

Compte un peu moins de deux heures pour la premiere mise en ligne.

---

## 3. Etape 1 : preparer Supabase

1. Sur supabase.com, clique sur **New project**.
2. Nom : `common-quest`. **Region : Frankfurt ou Paris**, c est important pour le RGPD, les donnees restent en Europe.
3. Choisis un mot de passe de base de donnees et note le dans ton gestionnaire de mots de passe.
4. Une fois le projet cree, ouvre **SQL Editor**, puis **New query**.
5. Copie tout le contenu du fichier `supabase/schema.sql`, colle le, clique sur **Run**. Tu dois voir "Success".
6. Nouvelle requete, meme chose avec `supabase/seed.sql` : cela charge la programmation issue du communique de presse.
7. Va dans **Project Settings > API** et note deux valeurs :
   - **Project URL**
   - **anon public key**

   Ces deux valeurs sont faites pour etre publiques, la securite repose sur les regles ecrites dans `schema.sql`.
   La cle **service_role** sur la meme page ne doit jamais sortir de Supabase, ne la mets nulle part dans le code.

8. Va dans **Authentication > Providers > Email** et verifie que **Confirm email** est active.
9. Va dans **Authentication > Policies** ou **Auth settings** et regle :
   - longueur minimale du mot de passe : **12**
   - **Leaked password protection** : active, Supabase refuse alors les mots de passe deja apparus dans des fuites connues.
10. Dans **Authentication > URL Configuration**, mets pour l instant `http://localhost:3000` en Site URL. Tu reviendras y mettre ton vrai domaine.

---

## 4. Etape 2 : faire tourner le site sur ton ordinateur

Ouvre le dossier du projet dans VS Code, puis le terminal (menu Terminal > New Terminal) et tape :

```bash
npm install
```

Duplique le fichier `.env.local.example`, renomme la copie `.env.local` et remplis :

```
NEXT_PUBLIC_SUPABASE_URL=https://tonprojet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Puis lance :

```bash
npm run dev
```

Ouvre http://localhost:3000 dans ton navigateur. Le site doit s afficher avec la programmation.

Le fichier `.env.local` n est jamais envoye sur GitHub, c est prevu dans `.gitignore`.

---

## 5. Etape 3 : envoyer le code sur GitHub

Sur github.com, cree un depot **prive** nomme `common-quest-site`, sans README.
Puis, dans le terminal a la racine du projet :

```bash
git init
git add .
git commit -m "Site Common Quest, premiere version"
git branch -M main
git remote add origin https://github.com/TON-COMPTE/common-quest-site.git
git push -u origin main
```

Pour chaque modification future :

```bash
git add .
git commit -m "Ce que j ai change"
git push
```

Vercel republie le site tout seul a chaque `git push`. 🚀

---

## 6. Etape 4 : publier avec Vercel

1. Sur vercel.com, clique **Add New > Project**, connecte ton GitHub, choisis `common-quest-site`.
2. Vercel detecte Next.js tout seul, ne touche a rien dans les reglages de build.
3. Ouvre **Environment Variables** et ajoute les trois memes lignes que dans `.env.local`, en mettant cette fois pour `NEXT_PUBLIC_SITE_URL` l adresse que Vercel va te donner, par exemple `https://common-quest-site.vercel.app`.
4. Clique **Deploy**, attends deux minutes.
5. Retourne dans Supabase, **Authentication > URL Configuration** :
   - Site URL : ton adresse Vercel ou ton domaine
   - Redirect URLs : ajoute `https://ton-domaine/auth/callback` et `http://localhost:3000/auth/callback`

---

## 7. Etape 5 : devenir administrateur

1. Sur le site en ligne, cree ton compte via **Creer un compte** et confirme l email recu.
2. Retourne dans Supabase, **SQL Editor**, et lance cette requete avec ton adresse :

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'ton.email@exemple.fr');
```

3. Reconnecte toi sur le site : le lien **Back office** apparait dans le menu.

Pour donner l acces a une autre personne de l equipe, meme requete avec son email. Utilise `'editor'` plutot que `'admin'` si tu veux distinguer les roles plus tard.

---

## 8. Etape 6 : mettre ton nom de domaine

1. Achete le domaine, par exemple `commonquest.fr`, chez OVH, Gandi ou Infomaniak.
2. Dans Vercel, **Settings > Domains > Add**, saisis le domaine, Vercel affiche les enregistrements DNS a copier chez ton hebergeur de domaine.
3. Le certificat HTTPS est cree automatiquement, il n y a rien a payer ni a configurer.
4. Mets a jour `NEXT_PUBLIC_SITE_URL` dans Vercel et le Site URL dans Supabase.

---

## 9. Utiliser le back office au quotidien

Adresse : `https://ton-domaine/fr/admin`

**Ajouter un evenement**
Evenements > Nouvel evenement. Remplis le titre en francais, puis passe sur les onglets EN et ES pour les traductions. Renseigne la journee, les horaires, le lieu, les tarifs. Colle le lien de billetterie dans le champ prevu, c est lui qui alimente le bouton "je prends ma place". Coche **Publier sur le site** quand c est pret, et **Mettre en avant sur l accueil** pour les temps forts.

**Ajouter le visuel d une tete d affiche**
Dans la fiche de l evenement, bloc **Visuel de l evenement**, clique sur choisir un fichier. Formats acceptes : JPG, PNG, WebP, AVIF, 5 Mo maximum. Format conseille : 1600 x 1200 pixels, la carte affiche l image en 4/3.

**Ajouter un membre de l equipe**
Equipe > formulaire de gauche. La photo s affiche en rond, en noir et blanc, et revient en couleur au survol. Prends des photos carrees pour un rendu propre.

**Un evenement gratuit**
Coche "Entree gratuite" : le site affiche une pastille gratuit et remplace le bouton par la mention entree libre.

**Un evenement dont la billetterie n est pas ouverte**
Laisse le champ lien billetterie vide : le site affiche "billetterie bientot ouverte".

---

## 10. Securite et RGPD, ce qui est deja en place

- **Mots de passe** : ils ne passent jamais par notre base ni par le code. Supabase les hashe en bcrypt, ils sont irrecuperables, y compris par toi en tant qu administrateur. Le site impose 12 caracteres avec majuscule, minuscule et chiffre, et affiche une jauge de robustesse.
- **Row Level Security** activee sur toutes les tables : meme si quelqu un recupere la cle publique du site, il ne peut lire que le contenu publie et ne peut rien ecrire.
- **Acces au back office** verifie a deux endroits : dans le middleware avant l affichage, et dans la base a chaque ecriture. Impossible de forcer l URL `/admin`.
- **En tetes de securite** : Content Security Policy avec nonce unique par page, HSTS, anti-clickjacking, anti-sniffing, Referrer-Policy, Permissions-Policy.
- **Cookies** : uniquement session et langue, aucun traceur publicitaire, donc pas de consentement prealable obligatoire, le bandeau reste informatif.
- **Pages legales** : mentions legales et politique de confidentialite conformes au RGPD, avec droit d acces, de rectification, d effacement et mention de la CNIL.
- **Redirections** : le retour de confirmation d email n accepte que des chemins internes, pas de redirection ouverte.
- **Envoi d images** : type et poids verifies, nom de fichier regenere, ecriture reservee aux administrateurs.
- **Donnees en Europe** : Supabase region Francfort ou Paris, a choisir a la creation du projet.

**Ce qui reste a ta charge**
1. Activer la double authentification sur GitHub, Vercel et Supabase.
2. Completer les mentions legales avec le numero RNA de l association.
3. Signer un accord de sous traitance avec Supabase et Vercel, disponible dans leurs parametres de conformite, si tu collectes des emails de newsletter.
4. Tenir un registre des traitements, un simple tableau suffit pour une association.
5. Ne jamais coller la cle `service_role` dans le code ou dans un message.

---

## 11. En cas de pepin

| Symptome | Piste |
| --- | --- |
| Le site s affiche mais le programme est vide | `seed.sql` n a pas ete lance, ou les variables d environnement sont fausses dans Vercel |
| "Back office" n apparait pas | Le role n est pas passe a `admin` dans `profiles`, ou il faut se deconnecter puis se reconnecter |
| L email de confirmation n arrive pas | Regarde dans les spams, verifie les Redirect URLs dans Supabase |
| L envoi d image echoue | Verifier que le bucket `media` existe et que ton compte est admin |
| Le deploiement Vercel echoue | Ouvre l onglet Logs du deploiement, l erreur est presque toujours une variable d environnement manquante |

---

## 12. Structure du projet

```
src/
  app/[locale]/          pages publiques et back office, par langue
  app/auth/callback/     retour des liens email
  components/            entete, cartes, formulaires, editeurs
  i18n/                  textes fr, en, es
  lib/                   acces base de donnees, formatage, types
supabase/
  schema.sql             tables, securite, stockage
  seed.sql               programmation de depart
middleware.ts            langues, en tetes de securite, protection du back office
```

Couleurs du festival : `#E7FF36` acide, `#7E1AFF` violet, `#1E1E1E` encre, `#EFEFEF` papier.
