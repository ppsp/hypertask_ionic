import { Injectable } from '@angular/core';
import { ReleaseNote } from '../models/Core/release-note';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ILocalStorageService } from '../interfaces/i-local-storage-service';

@Injectable({
  providedIn: 'root'
})
export class ChangelogService {

  constructor(//private appVersion: AppVersion,
              private storage: ILocalStorageService,
              private alertCtrl: AlertController,
              private translate: TranslateService) { }

  public async showChangeLogsAndSetToViewed(): Promise<void> {
    /*const currentVersion = await this.appVersion.getVersionNumber(); TODO CAPACITOR
    const shouldViewChangeLog = await this.storage.shouldViewChangeLog(currentVersion);
    if (shouldViewChangeLog === true) {
      const releaseNotes = this.getReleaseNote(currentVersion);
      if (releaseNotes != null) {
        const message: string = this.getFormattedReleaseNotes(releaseNotes);

        const alert = await this.alertCtrl.create({
          message,
          buttons: [
            {
              text: 'Ok',
              handler: () => {
                this.storage.setChangeLogToViewed(currentVersion);
              }
            },
          ]
        });

        await alert.present();
      }
    }*/
  }

  public async showAllChangeLogs(): Promise<void> {
      const releaseNotes = this.getReleaseNotes();
      if (releaseNotes != null) {
        const message: string = this.getAllFormattedReleaseNotes(releaseNotes);
        const alert = await this.alertCtrl.create({
          message,
          buttons: [
            {
              text: 'Ok',
            },
          ]
        });

        await alert.present();
      }
  }

  private getFormattedReleaseNotes(releaseNotes: ReleaseNote) {
    const lines: string[] = [];

    if (releaseNotes.BugFixesEn.length > 0) {
      if (this.translate.currentLang === 'en') {
        lines.push('BUG FIXES :<br/>');
        releaseNotes.BugFixesEn.forEach(p => lines.push('- ' + p + '<br/>'));
      } else {
        lines.push('BUGS CORRIGÉS :<br/>');
        releaseNotes.BugFixesFr.forEach(p => lines.push('- ' + p + '<br/>'));
      }
    }

    if (releaseNotes.FeaturesEn.length > 0) {
      if (this.translate.currentLang === 'en') {
        lines.push('FEATURES :<br/>');
        releaseNotes.FeaturesEn.forEach(p => lines.push('- ' + p + '<br/>'));
      } else {
        lines.push('FONCTIONNALITÉS :<br/>');
        releaseNotes.FeaturesFr.forEach(p => lines.push('- ' + p + '<br/>'));
      }
    }

    return lines.join('<br>');
  }

  private getAllFormattedReleaseNotes(releaseNotes: ReleaseNote[]) {
    const lines: string[] = [];
    const sortedNotes = releaseNotes.reverse();

    for (const note of sortedNotes) {
      lines.push('Version ' + note.Version);
      lines.push('<br>');
      lines.push('<br>');
      lines.push(this.getFormattedReleaseNotes(note));
      lines.push('<br>');
      lines.push('=======================');
      lines.push('<br>');
    }

    // console.log(lines.join(''));

    return lines.join('');
  }

  public getReleaseNote(version: string): ReleaseNote {
    const allNotes = this.getReleaseNotes();

    const releventNotes = allNotes.filter(p => p.Version === version);

    if (releventNotes != null && releventNotes.length === 1) {
      return releventNotes[0];
    } else {
      // TODO: throw error
      return null;
    }
  }

  private getReleaseNotes(): ReleaseNote[] {
    const releaseNotes: ReleaseNote[] = [];

    let releaseNote = new ReleaseNote();
    releaseNote.Version = '0.0.7';
    releaseNote.BugFixesEn.push('The timer pause button was not working properly because ' +
                              'the start button was not resseting its paused state');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.0.8';
    releaseNote.FeaturesEn.push('A new AddComment button was added which enables the user to ' +
                             'add a comment on a Task Result');
    releaseNote.FeaturesEn.push('The current task result is now part of the result charts');
    releaseNote.FeaturesEn.push('Feedback can now be sent using the Sent Feedback button in the main menu');
    releaseNote.FeaturesEn.push('The buttons on the menu are now all the same size');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.0.9';
    releaseNote.FeaturesEn.push('Added Task Frequencies : Once and Once until done. Available in task creation or task editting');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.0.10';
    releaseNote.FeaturesEn.push('Tasklist buttons layout alignment changed');
    releaseNote.FeaturesEn.push('Create and Edit task layout changed');
    releaseNote.BugFixesEn.push('The application should minimize instead of stopping when clicking back button');
    releaseNote.BugFixesEn.push('Task name and position is now validated');
    releaseNote.BugFixesEn.push('Task assigned date can\'t be null for Once tasks');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.0.12';
    releaseNote.FeaturesEn.push('Added message: Checking for update on Checking for update button');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.0.14';
    releaseNote.BugFixesEn.push('Fixed timer when device is sleeping on android');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.0.16';
    releaseNote.FeaturesEn.push('Removed all login options except email');
    releaseNote.FeaturesEn.push('French option added (not yet fully functionnal)');
    releaseNote.BugFixesEn.push('Assigned date can now be later than the current year');
    releaseNote.BugFixesEn.push('Previous and Next date buttons now work properly');
    releaseNote.BugFixesEn.push('Results entered are now instantly shown');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.0.17';
    releaseNote.BugFixesEn.push('Results entered are now instantly shown');
    releaseNote.BugFixesEn.push('Data synchronisation doesn\'t modify display anymore');
    releaseNote.BugFixesEn.push('Synchronization problems fixed');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.0.18';
    releaseNote.BugFixesEn.push('Non reccuring tasks will stop appearing after they are done');
    releaseNote.BugFixesEn.push('Started or paused timer will reappear if you change date and come back');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.0';
    releaseNote.FeaturesEn.push('The next task does\'t get selected anymore');
    releaseNote.FeaturesEn.push('Starting the timer only shows the timer');
    releaseNote.FeaturesEn.push('The stats only get displayed when click on the stats button');
    releaseNote.FeaturesEn.push('Stats for Sleeping time and for Fasting time added');
    releaseNote.FeaturesEn.push('Stats for 1 week, 1 month, 3 months or 1 year available');
    releaseNote.FeaturesEn.push('Task selection menu added, and automatically appears when user has no task yet');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.1';
    releaseNote.FeaturesEn.push('Added back button to create task component');
    releaseNote.FeaturesEn.push('Stats always shown when clicking on Show Stats');
    releaseNote.FeaturesEn.push('Task card buttons rearranged into a grid');
    releaseNote.FeaturesEn.push('Bigger mininum stat rectangle size');
    releaseNote.FeaturesEn.push('Changed DateTime format for task durations');
    releaseNote.FeaturesEn.push('Seconds are displayed and can be entered for durations');
    releaseNote.FeaturesEn.push('Done duration task can be resumed');
    releaseNote.FeaturesEn.push('Most buttons are now hidden when viewing the future');
    releaseNote.BugFixesEn.push('Stats start from -1 instead of -8');
    releaseNote.BugFixesEn.push('Timer now isnt displayed when a task is done');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.2';
    releaseNote.FeaturesEn.push('Added a majority of french translations');
    releaseNote.BugFixesEn.push('Fixed multiple timer issues');
    releaseNote.BugFixesEn.push('Fixed multiple duration issues');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.13';
    releaseNote.BugFixesEn.push('Fixed broken app');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.4';
    releaseNote.FeaturesEn.push('Ionic updated to version 5');
    releaseNote.FeaturesEn.push('Create Task and Edit Task UI improved');
    releaseNote.BugFixesEn.push('Create non-recurring task now gets created as non-recurring');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.5';
    releaseNote.BugFixesEn.push('Fixed stats buttons localization');
    releaseNote.BugFixesEn.push('Fixed Single day vs Until done on Create/Edit task');
    releaseNote.BugFixesEn.push('Local data isn\'t accessible from another account');
    releaseNote.BugFixesEn.push('Can\'t create a daily task where there is no selected required days');
    releaseNote.FeaturesEn.push('Comment is displayed after adding comment');
    releaseNote.FeaturesEn.push('Cards get unselected when changing date');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.6';
    releaseNote.BugFixesEn.push('Fixed some translations that were not loading properly');
    releaseNote.BugFixesEn.push('Fixed resume timer which was bugged when phone was sleeping');
    releaseNote.BugFixesEn.push('Duration now show as HH:mm in stats instead of total seconds');
    releaseNote.BugFixesEn.push('Menu title position fixed');
    releaseNote.BugFixesEn.push('Until Done task doesn\'t appear one month later anymore');
    releaseNote.FeaturesEn.push('Language preference is now saved');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.7';
    releaseNote.BugFixesEn.push('Lazy load stats + graph in order to improve performance');
    releaseNote.BugFixesEn.push('Used push component update instead of function binding to greatly improve performance');
    releaseNote.FeaturesEn.push('Added popup to validate time of day for end of day tasks');
    releaseNote.FeaturesEn.push('Hidden show stats button for Once tasks');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.8';
    releaseNote.BugFixesEn.push('Fixed Results that were not showing');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.9';
    releaseNote.FeaturesEn.push('Default task position can be chosen');
    releaseNote.BugFixesEn.push('Release notes button was not working');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.10';
    releaseNote.FeaturesEn.push('Skip until button added for non-recurring tasks');
    releaseNote.FeaturesEn.push('Skip All button added for previous days where not all tasks have been completed');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.11';
    releaseNote.BugFixesEn.push('Resume button doesn\'t show after voiding a task');
    releaseNote.BugFixesEn.push('Added comment is shown');
    releaseNote.BugFixesEn.push('Prod and Dev are different environments');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.13';
    releaseNote.FeaturesEn.push('Changelog messages also available in french');
    releaseNote.FeaturesFr.push('Messages de mises à jour disponibles en français');
    releaseNote.FeaturesEn.push('We can choose bug/feature when sending feedback');
    releaseNote.FeaturesFr.push('On peut choisir entre bug/feature lorsqu\'on envoie du feedback');
    releaseNote.BugFixesEn.push('Improved performance');
    releaseNote.BugFixesFr.push('Amélioration de performance');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.14';
    releaseNote.BugFixesEn.push('Improved some french localizations');
    releaseNote.BugFixesFr.push('Amélioration du français');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.15';
    releaseNote.BugFixesEn.push('Fixed decimal value which was not working in french');
    releaseNote.BugFixesFr.push('Corrigé les valeurs décimales qui ne fonctionnaient pas en français');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.16';
    releaseNote.BugFixesEn.push('Fixed time value which was not working in french');
    releaseNote.BugFixesFr.push('Corrigé les valeurs de temps qui ne fonctionnaient pas en français');
    releaseNote.BugFixesEn.push('Fixed comments which were not working in french');
    releaseNote.BugFixesFr.push('Corrigé les commentaires qui ne fonctionnaient pas en français');
    releaseNote.BugFixesEn.push('Fixed changelogs which were displayed in english');
    releaseNote.BugFixesFr.push('Corrigé la liste de changements qui apparaissait en anglais');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.17';
    releaseNote.FeaturesEn.push('Added save icon in task selection page');
    releaseNote.FeaturesFr.push('Ajouté un icône de sauvegarde sur la page de sélection de tâches');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.18';
    releaseNote.FeaturesEn.push('Added native back button functionality');
    releaseNote.FeaturesFr.push('Ajouté fonctionalité de bouton retour natif');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.19';
    releaseNote.BugFixesEn.push('Centered text in task selection page');
    releaseNote.BugFixesFr.push('Centré le text dans la page de sélection de tâches');
    releaseNote.BugFixesEn.push('When backing out of editting task, there is no warning popup if nothing was changed');
    releaseNote.BugFixesFr.push('Lorsque la page de modification de tâche est fermée il n\'y a plus de message ' +
                                'd\'avertissement si la tâche n\'a pas été modifiée');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.20';
    releaseNote.FeaturesEn.push('Statistics now display today\'s value');
    releaseNote.FeaturesFr.push('Les statistiques affichent maintenant la valeur d\'aujourd\'hui');
    releaseNote.BugFixesEn.push('Fixed statistics display bugs');
    releaseNote.BugFixesFr.push('Corrigé des bugs d\'affichage de statistiques');
    releaseNote.BugFixesEn.push('Fixed future false results that were shown');
    releaseNote.BugFixesFr.push('Enlevé des faux résultats futurs qui s\'affichaient');
    releaseNote.BugFixesEn.push('Fixed future buttons that were not dissapearing');
    releaseNote.BugFixesFr.push('Corrigé boutons futurs qui ne dispasaissaient pas');
    releaseNote.BugFixesEn.push('Added loading animation when postponing');
    releaseNote.BugFixesFr.push('Ajouté une animation lors d\'une remise à plus tard');
    releaseNote.BugFixesEn.push('Fixed progress bar that was showing wrong numbers');
    releaseNote.BugFixesFr.push('Corrigé la barre de progrès qui indiquait des mauvais chiffres');
    releaseNote.BugFixesEn.push('Removed loading popup for Resume Timer');
    releaseNote.BugFixesFr.push('Enlevé le popup de chargement lors de continuer timer');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.21';
    releaseNote.FeaturesEn.push('New users can choose language before choosing tasks');
    releaseNote.FeaturesFr.push('Les nouveaux utilisateurs peuvent choisir leur langue avant de choisir leur tâches');
    releaseNote.FeaturesEn.push('Tasks selection cards are smaller');
    releaseNote.FeaturesFr.push('Les cartes de la sélection de tâches sont plus petites');
    releaseNote.BugFixesEn.push('Task type was not working properly in Edit Task');
    releaseNote.BugFixesFr.push('Type de tâche ne fonctionnait pas correctement dans Modifier Tâche');
    releaseNote.BugFixesEn.push('Task selection cards were not saved properly');
    releaseNote.BugFixesFr.push('La sélection de tâche ne s\'enregistrait pas');
    releaseNote.BugFixesEn.push('Old tasks were appearing in position selection');
    releaseNote.BugFixesFr.push('Anciennes tâches qui apparaîssaient dans la sélection de la position');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.22';
    releaseNote.BugFixesEn.push('Task reordering was not working properly');
    releaseNote.BugFixesFr.push('L\'ordre des tâches ne fonctionnait pas bien');
    releaseNote.BugFixesEn.push('History doesn\'t get deleted when modifying task');
    releaseNote.BugFixesFr.push('L\'historique ne se fait plus supprimer lors de modification de tâche');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.23';
    releaseNote.FeaturesEn.push('Task reordering improved');
    releaseNote.FeaturesFr.push('Amélioration du changement de l\'ordre des tâches');
    releaseNote.FeaturesEn.push('Added max, average, total for stats');
    releaseNote.FeaturesFr.push('Ajouté max, moyenne et total pour les statistiques');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.25';
    releaseNote.FeaturesEn.push('Task reordering improved');
    releaseNote.FeaturesFr.push('Amélioration du changement de l\'ordre des tâches');
    releaseNote.FeaturesEn.push('Settings page added');
    releaseNote.FeaturesFr.push('Ajout d\'une page de configuration');
    releaseNote.FeaturesEn.push('End of day setting added');
    releaseNote.FeaturesFr.push('Ajout de configuration d\'heure de fin de journée');
    releaseNote.BugFixesEn.push('Stat maximum is 0 when there is no data');
    releaseNote.BugFixesFr.push('La statistique maximum est 0 lorsqu\'aucune donnée');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.26';
    releaseNote.FeaturesEn.push('Dates displayed on horizontal axis on charts');
    releaseNote.FeaturesFr.push('Dates affichées sur l\'axe horizontal sur les graphiques');
    releaseNote.BugFixesEn.push('Tasks reordering improved');
    releaseNote.BugFixesFr.push('Changement d\'ordre des tâches amélioré');
    releaseNote.BugFixesEn.push('Fixed wrong day total');
    releaseNote.BugFixesFr.push('Corrigé bug total de la journée qui n\'était pas bon');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.27';
    releaseNote.FeaturesEn.push('Added a tab to separate chart from data details');
    releaseNote.FeaturesFr.push('Ajouté un onglet pour séparer les graphiques des détails des données');
    releaseNote.BugFixesEn.push('Default position was broken');
    releaseNote.BugFixesFr.push('Position par défaut ne fonctionnait plus');
    releaseNote.BugFixesEn.push('Improved performance');
    releaseNote.BugFixesFr.push('Amélioré performance');
    releaseNote.BugFixesEn.push('Postpone button now always appears on postponable tasks');
    releaseNote.BugFixesFr.push('Bouton Remettre apparaît toujours sur les tâches remettables');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.28';
    releaseNote.BugFixesEn.push('Too long to load task stats');
    releaseNote.BugFixesFr.push('Trop long à charger les statistiques d\'une tâche');
    releaseNote.BugFixesEn.push('Display bug for duration');
    releaseNote.BugFixesFr.push('Bug d\'affichage pour les durées');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.29';
    releaseNote.FeaturesEn.push('Added completion rate stats');
    releaseNote.FeaturesFr.push('Ajouté taux de complétion dans les statistiques');
    releaseNote.BugFixesEn.push('Task position displayed for debugging purposes');
    releaseNote.BugFixesFr.push('Position des tâches affichée pour débugger');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.30';
    releaseNote.FeaturesEn.push('Refreshing while a timer is on will prompt a warning');
    releaseNote.FeaturesFr.push('Ajout d\'un avertissement lorsqu\'on rafraichit pendant qu\'un timer est en marche');
    releaseNote.BugFixesEn.push('Reload from server doesn\'t delete your local data');
    releaseNote.BugFixesFr.push('Rafraîchir n\'écrase pas vos données locales');
    releaseNote.BugFixesEn.push('Task assigned tomorrow doesn\'t appear today');
    releaseNote.BugFixesFr.push('Tâches assignées à demain n\'apparaissent pas aujourd\'hui');
    releaseNote.BugFixesEn.push('Problem with created task ordering');
    releaseNote.BugFixesFr.push('Problème d\'ordre de nouvelle tâche créée');
    releaseNote.BugFixesEn.push('Pause and resume buttons were sometimes dissapearing');
    releaseNote.BugFixesFr.push('Les boutons Pause et Continuer disparaissaient parfois');
    releaseNote.BugFixesEn.push('Deleting a task was sometimes too slow');
    releaseNote.BugFixesFr.push('Effacer une tâche était parfois trop lent');
    releaseNote.BugFixesEn.push('New task\'s statistics were crashing the application');
    releaseNote.BugFixesFr.push('Les statistiques d\'une nouvelle tâche faisait planter l\'application');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.31';
    releaseNote.BugFixesEn.push('Fixed bug where data was not saved');
    releaseNote.BugFixesFr.push('Corrigé bug où les données n\'étaient pas sauvegardées');
    releaseNote.BugFixesEn.push('Automated current date update');
    releaseNote.BugFixesFr.push('Changement de la date courante automatique');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.32';
    releaseNote.BugFixesEn.push('Fixed bug where note could not be added');
    releaseNote.BugFixesFr.push('Corrigé bug où les notes ne pouvaient pas être ajoutées');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.39';
    releaseNote.BugFixesEn.push('Fixed timer that dissapeared when it was a resumed timer');
    releaseNote.BugFixesFr.push('Corrigé timer qui disparaissait lorsqu\'il était reparti');
    releaseNote.BugFixesEn.push('Fixed bug when selecting tasks');
    releaseNote.BugFixesFr.push('Corrigé bug lors de la sélection de tâches');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.40';
    releaseNote.BugFixesEn.push('Fixed task selection that was not working properly');
    releaseNote.BugFixesFr.push('Corrigé sélection de tâche qui ne fonctionnait pas bien');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.41';
    releaseNote.BugFixesEn.push('Fixed sleeping stats bug');
    releaseNote.BugFixesFr.push('Corrigé bug de statistiques de sommeil');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.42';
    releaseNote.BugFixesEn.push('Tasks shown in ordering popup are now only present and future tasks');
    releaseNote.BugFixesFr.push('Les tâches montrées dans le changement d\'ordre ne sont que les tâches présentes et futures');
    releaseNote.BugFixesEn.push('New task shows only stats from date creation');
    releaseNote.BugFixesFr.push('Les statistiques montrées ne sont que les statistiques depuis la création de la tâche');
    releaseNote.BugFixesEn.push('Time Sleep was sometimes saved with the wrong date');
    releaseNote.BugFixesFr.push('L\'Heure de sommeil était parfois enregistrée avec la mauvaise date');
    releaseNote.BugFixesEn.push('Fixed an error when creating a task');
    releaseNote.BugFixesFr.push('Corrigé une erreur lorsqu\'une tâche est créée');
    releaseNote.BugFixesEn.push('Improved reordering performance');
    releaseNote.BugFixesFr.push('Amélioré la performance du changement d\'ordre');
    // releaseNote.FeaturesEn.push('Automatically select the current time when entering a time');
    // releaseNote.FeaturesFr.push('L\'Heure présente est sélectionnée automatiquement lorsqu\'on entre une heure');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.44';
    releaseNote.BugFixesEn.push('Fixed database locked bug');
    releaseNote.BugFixesFr.push('Corrigé bug de base de donnée gelée');
    releaseNote.BugFixesEn.push('Fixed reordering bug');
    releaseNote.BugFixesFr.push('Corrigé bug de changement d\'ordre');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.45';
    releaseNote.BugFixesEn.push('Fixed reordering bug');
    releaseNote.BugFixesFr.push('Corrigé bug de changement d\'ordre');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.46';
    releaseNote.FeaturesEn.push('Added privacy policy');
    releaseNote.FeaturesFr.push('Ajout d\'une politique de confidentialité');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.49';
    releaseNote.FeaturesEn.push('Changed application name');
    releaseNote.FeaturesFr.push('Changé le nom de l\'application');
    releaseNote.FeaturesEn.push('Changed icon');
    releaseNote.FeaturesFr.push('Changé l\'icône');
    releaseNote.FeaturesEn.push('Removed splash screen');
    releaseNote.FeaturesFr.push('Enlevé le splash screen');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.50';
    releaseNote.FeaturesEn.push('Added Terms and conditions');
    releaseNote.FeaturesFr.push('Ajouté Termes et conditions');
    releaseNote.FeaturesEn.push('Timer doesn\'t dissapear when creating a task');
    releaseNote.FeaturesFr.push('Le timer ne disparaît pas lorsqu\'on crée une tâche');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.51';
    releaseNote.BugFixesEn.push('Sometimes tasks were getting created twice');
    releaseNote.BugFixesFr.push('Parfois les tâches étaient créées deux fois');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.54';
    releaseNote.BugFixesEn.push('Initial loading and date change loading is slightly faster');
    releaseNote.BugFixesFr.push('Le chargement et changement de date est un peu plus rapide');
    releaseNote.BugFixesEn.push('Improved performance when creating/inserting tasks or results');
    releaseNote.BugFixesFr.push('Amélioration de la performance lors de création/modification de tâches et de résultats');
    releaseNote.BugFixesEn.push('Stats get pre-loaded by a background thread');
    releaseNote.BugFixesFr.push('Les statistiques sont pré-chargées par un processus en arrière plan');
    releaseNote.BugFixesEn.push('Fix error when logging out');
    releaseNote.BugFixesFr.push('Corrigé erreur lors du logout');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.55';
    releaseNote.BugFixesEn.push('Fixed timer that wasn\'t working');
    releaseNote.BugFixesFr.push('Corrigé timer qui ne fonctionnait plus');
    releaseNote.BugFixesEn.push('Fixed stats that were not working');
    releaseNote.BugFixesFr.push('Corrigé statistiques qui ne fonctionnaient pas');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.56';
    releaseNote.BugFixesEn.push('Fixed stats that were not showing');
    releaseNote.BugFixesFr.push('Corrigé statistiques qui ne s\'affichaient pas');
    releaseNote.FeaturesEn.push('Removed some loading spinners');
    releaseNote.FeaturesFr.push('Enlevé quelque spinners de chargement');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.57';
    releaseNote.BugFixesEn.push('Calendar is smaller');
    releaseNote.BugFixesFr.push('Le calendrier est plus petit');
    releaseNote.BugFixesEn.push('Assigned date is now changed with a calendar');
    releaseNote.BugFixesFr.push('La date assignée est maintenant changée avec un calendrier');
    releaseNote.BugFixesEn.push('Time sleep now appears at the top of the charts');
    releaseNote.BugFixesFr.push('L\'Heure de sommeil apparaît maintenant au sommet des graphiques');
    releaseNote.BugFixesEn.push('Stopped displaying confirmation popup when entering 18:30 last meal');
    releaseNote.BugFixesFr.push('Enlevé le popup de confirmation lorsqu\'on entre un dernier repas à 18h30');
    releaseNote.FeaturesEn.push('Stop trying to sync when offline');
    releaseNote.FeaturesFr.push('Ne plus essayer de synchroniser lorsque hors ligne');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.58';
    releaseNote.BugFixesEn.push('The progress bar works when entering the application');
    releaseNote.BugFixesFr.push('La barre de progrès fonctionne lorsqu\'on entre dans l\'application');
    releaseNote.BugFixesEn.push('Lock ui when reloading');
    releaseNote.BugFixesFr.push('UI gelé lors du chargement');
    releaseNote.BugFixesEn.push('All \'yes\' buttons are on the right on dialogs');
    releaseNote.BugFixesFr.push('Tous les boutons \'oui\' sont à droite dans les dialogues');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.59';
    releaseNote.BugFixesEn.push('Removed loading popup when deleting a task');
    releaseNote.BugFixesFr.push('Enlevé le popup de chargement lorsqu\'une tâche est supprimée');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.61';
    releaseNote.FeaturesEn.push('Improved create/edit task UI as well as settings UI');
    releaseNote.FeaturesFr.push('Amélioré le UI de la création/modification de tâches ainsi que les configurations');
    releaseNote.FeaturesEn.push('Improved Landscape usability');
    releaseNote.FeaturesFr.push('Amélioré l\'utilisabilité du mode paysage');
    releaseNote.FeaturesEn.push('Added option to not sync data on server for privacy');
    releaseNote.FeaturesFr.push('Ajouté option pour ne pas synchroniser sur un serveur pour confidentialité');
    releaseNote.BugFixesEn.push('Bug in task ordering fixed');
    releaseNote.BugFixesFr.push('Corrigé bug sur l\'ordre des tâches');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.64';
    releaseNote.BugFixesEn.push('Changed timepicker implementation');
    releaseNote.BugFixesFr.push('Changé implémentation du timepicker');
    releaseNote.BugFixesEn.push('Tasks don\'t get created multiple times when spamming');
    releaseNote.BugFixesFr.push('Les tâches ne se font pas créer plusieurs fois si on spam');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.66';
    releaseNote.BugFixesEn.push('Bug in task ordering fixed');
    releaseNote.BugFixesFr.push('Corrigé bug sur l\'ordre des tâches');
    releaseNote.FeaturesEn.push('Inactive accounts are deleted after one year');
    releaseNote.FeaturesFr.push('Les comptes inactifs sont supprimés après un an d\'inactivité');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.67';
    releaseNote.BugFixesEn.push('Bug in task ordering fixed');
    releaseNote.BugFixesFr.push('Corrigé bug sur l\'ordre des tâches');
    releaseNote.BugFixesEn.push('Entering empty number value doesn\'t save');
    releaseNote.BugFixesFr.push('Ne rien entrer lorsqu\'on entre un nombre ne sauvegarde pas');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.68';
    releaseNote.BugFixesEn.push('Enter time for end of day is now centered');
    releaseNote.BugFixesFr.push('Entrer l\'heure de fin de journée le popup est maintenant centré');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.80';
    releaseNote.BugFixesEn.push('Fixed database is locked problem');
    releaseNote.BugFixesFr.push('Corrigé un problème de base de donnée barrée');
    releaseNote.BugFixesEn.push('Accelerated initial loading');
    releaseNote.BugFixesFr.push('Chargement initial accéléré');
    releaseNote.BugFixesEn.push('Added more logs for debugging');
    releaseNote.BugFixesFr.push('Ajouté des logs pour le débuggage');
    releaseNote.BugFixesEn.push('Fixed bug where data would keep trying to save because of duplicate id');
    releaseNote.BugFixesFr.push('Corrigé bug de donnée qui essaie toujours de sauvegarder à cause d\'un id dupliqué');
    releaseNote.BugFixesEn.push('Faster login load');
    releaseNote.BugFixesFr.push('Chargement plus rapide lors du login');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.1.87';
    releaseNote.FeaturesEn.push('Added icons on buttons');
    releaseNote.FeaturesFr.push('Ajouté des icônes sur des boutons');
    releaseNote.FeaturesEn.push('Notes can be browsed, updated and deleted in the Notes menu');
    releaseNote.FeaturesFr.push('Nouveau menu Notes ou on peut naviguer, dans les notes et les mettre à jour ou les supprimer');
    releaseNote.FeaturesEn.push('Added cancel timer button');
    releaseNote.FeaturesFr.push('Ajouté bouton pour annuler timer');
    // releaseNote.FeaturesEn.push('Added "..." button on the task list header to access quick configs but it\'s only mocked for now');
    // releaseNote.FeaturesFr.push('Ajouté un bouton "..." en haut de la liste de tâches mais ce n\'est pas encore fonctionnel');
    releaseNote.FeaturesEn.push('Added calendar to pick date when clicking on current day');
    releaseNote.FeaturesFr.push('Ajouté un calendrier pour choisir la date lorsqu\'on clique sur la journée présente');
    releaseNote.FeaturesEn.push('Timers are now persistent (saved locally on the phone, not on server)');
    releaseNote.FeaturesFr.push('Les timers sont maintenant sauvegardés dans la base de donnée (locale seulement, pas sur le serveur)');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.2.16';
    releaseNote.FeaturesEn.push('Added task groups, all tasks are now assigned to a group which has a name, color, order');
    releaseNote.FeaturesFr.push('Ajouté des groupes de tâches, toutes les tâches sont maintenant assignées à un groupe qui a un nom, ' +
                                'une couleur et un ordre');
    releaseNote.FeaturesEn.push('Improved UI');
    releaseNote.FeaturesFr.push('Amélioré UI');
    releaseNote.FeaturesEn.push('Changed app name to HyperTask');
    releaseNote.FeaturesFr.push('Changé le nom de l\'application pour HyperTask');
    releaseNote.FeaturesEn.push('Updated icon to match app colors');
    releaseNote.FeaturesFr.push('Mis à jour l\'icône pour matcher avec les couleurs de l\'application');
    releaseNote.FeaturesEn.push('Removed text on main buttons, icons only');
    releaseNote.FeaturesFr.push('Enlevé le texte sur les boutons principaux, il n\'y a que des icônes maintenant');
    releaseNote.FeaturesEn.push('Popups to enter result doesn\'t fade anymore when clicking outside of the box');
    releaseNote.FeaturesFr.push('Les popups pour entrer le résultat ne se ferment plus lorsqu\'on clique à côté');
    releaseNote.FeaturesEn.push('Added popover menus');
    releaseNote.FeaturesFr.push('Ajouté menus en popup');
    releaseNote.BugFixesEn.push('Prevent sending empty feedback');
    releaseNote.BugFixesFr.push('Empêcher d\'envoyer du feedback vide');
    releaseNote.BugFixesEn.push('Fixed local database synchronization issues');
    releaseNote.BugFixesFr.push('Corrigé problèmes de synchronisation de données locales');
    releaseNote.BugFixesEn.push('Changed event handling to improve performance');
    releaseNote.BugFixesFr.push('Changé gestion d\'événements pour améliorer la performance');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.3.00';
    releaseNote.FeaturesEn.push('Added daily notifications for individual tasks');
    releaseNote.FeaturesFr.push('Ajouté des notifications journalières pour les tâches individuelles');
    releaseNote.FeaturesEn.push('Added ... button on the main page for a new popover menu');
    releaseNote.FeaturesFr.push('Ajouté bouton ... sur la page principale pour un nouveau menu popover');
    releaseNote.FeaturesEn.push('Added Prioritize vs Execute');
    releaseNote.FeaturesFr.push('Ajouté Prioriser ou Exécuter');
    releaseNote.FeaturesEn.push('Added drag and drop');
    releaseNote.FeaturesFr.push('Ajouté glisser-déposer');
    releaseNote.FeaturesEn.push('Added option to create group when creating a task');
    releaseNote.FeaturesFr.push('Ajouté option pour créer un group lorsqu\'on crée une tâche');
    releaseNote.FeaturesEn.push('Added auto-focus on some inputs');
    releaseNote.FeaturesFr.push('Ajouté auto-focus à quelque endroits');
    releaseNote.FeaturesEn.push('Added walkthrough for first time users');
    releaseNote.FeaturesFr.push('Ajouté tutoriel pour les nouveaux utilisateurs');
    releaseNote.FeaturesEn.push('Removed language choice, will focus on only english for the start and minimize maintenance requirement');
    releaseNote.FeaturesFr.push('Enlevé choix de langue, nous allons focusser seulement sur l\'anglais au début pour minimizer la ' +
    'maintenance');
    releaseNote.FeaturesEn.push('Moved "Skip All" button to new popover menu');
    releaseNote.FeaturesFr.push('Bougé "Tout sauter" dans un nouveau menu popover');
    releaseNote.FeaturesEn.push('Added "Postpone All" button to group popover menu');
    releaseNote.FeaturesFr.push('Ajout "Tout remettre" dans le menu popover de groupe');
    // to add later
    // releaseNote.FeaturesEn.push('Added popover with action suggestions when skipped modulo 7 days in a row');
    // releaseNote.FeaturesFr.push('Ajouté un popover avec des actions suggérées lorsqu\'une tâche est sautée 7 modulo fois de suite');
    releaseNote.FeaturesEn.push('Added cross-device auto-sync');
    releaseNote.FeaturesFr.push('Ajouté synchronisation automatique inter-appareils');
    releaseNote.FeaturesEn.push('Added retrieval/deletion of data for privacy compliance');
    releaseNote.FeaturesFr.push('Ajout du téléchargement ou suppression des données pour conformité de confidentialité');
    releaseNote.BugFixesEn.push('Fixed Skip All bugs');
    releaseNote.BugFixesFr.push('Corrigé des bugs pour tout sauter');
    releaseNote.BugFixesEn.push('Fixed popups that could appears multiple times when lagging');
    releaseNote.BugFixesFr.push('Corrigé des popups qui apparaissaient plusieurs fois lorsque ça laggais');
    releaseNote.BugFixesEn.push('Fixed timers that were not accurate');
    releaseNote.BugFixesFr.push('Corrigé timers qui n\'étaient pas précis');
    releaseNote.FeaturesEn.push('When changing task schedule type, ask if you want to change to the default group');
    releaseNote.FeaturesFr.push('Lorsque la fréquence de la tâche est changée, demander si vous voulez changer au groupe par défaut');
    releaseNote.FeaturesEn.push('Added setting option to lock in portrait mode');
    releaseNote.FeaturesFr.push('Ajouté option de barrer l\'écran en mode portrait');
    releaseNotes.push(releaseNote);

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.3.4';
    releaseNote.FeaturesEn.push('First version of pre-release');
    releaseNote.FeaturesFr.push('Première version du pre-release');

    releaseNote = new ReleaseNote();
    releaseNote.Version = '0.3.6';
    releaseNote.FeaturesEn.push('Improved performance');
    releaseNote.FeaturesFr.push('Amélioré la performance');

    return releaseNotes;
  }
}
