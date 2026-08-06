import '@opentui/core/runtime-plugin-support';
import {
  BoxRenderable,
  createCliRenderer,
  InputRenderable,
  InputRenderableEvents,
  SelectRenderable,
  SelectRenderableEvents,
  TextRenderable,
} from '@opentui/core';
import type { SelectOption } from '@opentui/core';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { convertMultiple, getAudioTracks } from '../converter.js';
import type { AudioTrack } from '../types/index.js';
import { expandGlobPattern } from '../utils/glob-expander.js';
import { cancel, resetCancellation } from '../utils/signal-handler.js';
import {
  createNamedOutputDirectory,
  createOutputDirectory,
  getDirectorySuggestions,
  getBrowserEntries,
  resolveDirectoryPath,
  type BrowserEntry,
} from './browser.js';

const backgroundColor = '#1e1e2e';
const panelColor = '#181825';
const borderColor = '#45475a';
const accentColor = '#89b4fa';
const mutedColor = '#a6adc8';
const videoPattern = '*.{mp4,MP4,avi,AVI,mkv,MKV,webm,WEBM,mov,MOV,flv,FLV,mpeg,MPEG,mpg,MPG,wmv,WMV,m4v,M4V,3gp,3GP,3g2,3G2}';

export async function runTui(): Promise<void> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('rconv tui requires an interactive terminal.');
  }

  const renderer = await createCliRenderer({
    exitOnCtrlC: false,
    exitSignals: [],
    clearOnShutdown: true,
  });
  const root = new BoxRenderable(renderer, {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    backgroundColor,
    padding: 1,
    gap: 1,
  });
  const header = new BoxRenderable(renderer, {
    width: '100%',
    height: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    border: true,
    borderColor,
    backgroundColor: panelColor,
    paddingX: 1,
  });
  const workspace = new BoxRenderable(renderer, {
    width: '100%',
    flexGrow: 1,
    flexDirection: 'row',
    gap: 1,
  });
  const actionsPanel = new BoxRenderable(renderer, {
    width: '24%',
    height: '100%',
    flexDirection: 'column',
    border: true,
    borderColor,
    backgroundColor: panelColor,
    title: 'Ações',
    padding: 1,
  });
  const browserPanel = new BoxRenderable(renderer, {
    width: '50%',
    height: '100%',
    flexDirection: 'column',
    border: true,
    borderColor,
    backgroundColor: panelColor,
    title: 'Biblioteca de mídia',
    padding: 1,
    gap: 1,
  });
  const detailsPanel = new BoxRenderable(renderer, {
    flexGrow: 1,
    height: '100%',
    flexDirection: 'column',
    border: true,
    borderColor,
    backgroundColor: panelColor,
    title: 'Detalhes da conversão',
    padding: 1,
    gap: 1,
  });
  const browser = new SelectRenderable(renderer, {
    width: '100%',
    flexGrow: 1,
    showScrollIndicator: true,
    showDescription: true,
    wrapSelection: true,
    selectedBackgroundColor: '#313244',
    selectedTextColor: accentColor,
  });
  const actions = new SelectRenderable(renderer, {
    width: '100%',
    flexGrow: 1,
    options: [
      { name: 'Usar pasta atual como entrada', description: 'Converte todos os vídeos compatíveis desta pasta', value: 'input' },
      { name: 'Usar pasta atual como saída', description: 'Salva os vídeos convertidos nesta pasta', value: 'output' },
      { name: 'Criar pasta de saída', description: 'Cria rconv-output na pasta atual', value: 'create-output' },
      { name: 'Digitar caminho de pasta', description: 'Abre qualquer pasta pelo caminho', value: 'path' },
      { name: 'Criar pasta com nome', description: 'Cria e seleciona uma pasta de saída', value: 'named-output' },
      { name: 'Selecionar faixas de áudio', description: 'Escolhe quais áudios serão convertidos', value: 'audio' },
      { name: 'Usar todas as faixas de áudio', description: 'Padrão compatível com DaVinci Resolve', value: 'all-audio' },
      { name: 'Iniciar conversão', description: 'Inicia a fila configurada', value: 'start' },
      { name: 'Cancelar conversão', description: 'Interrompe a conversão em andamento', value: 'cancel' },
      { name: 'Ir para a pasta pessoal', description: 'Volta ao diretório inicial do usuário', value: 'home' },
      { name: 'Revisar configuração', description: 'Confirma os dados antes de criar a fila', value: 'preview' },
    ],
    showDescription: true,
    wrapSelection: true,
    selectedBackgroundColor: '#313244',
    selectedTextColor: accentColor,
  });
  const location = new TextRenderable(renderer, { fg: accentColor });
  const configuration = new TextRenderable(renderer, { fg: '#cdd6f4', wrapMode: 'word' });
  const queuePanel = new BoxRenderable(renderer, {
    width: '100%',
    height: 10,
    flexDirection: 'column',
    border: true,
    borderColor,
    backgroundColor: panelColor,
    title: 'Fila de conversão',
    padding: 1,
    gap: 1,
  });
  const queuePreview = new TextRenderable(renderer, { fg: mutedColor, wrapMode: 'word' });
  const progress = new TextRenderable(renderer, { fg: accentColor });
  const logs = new TextRenderable(renderer, { fg: mutedColor, wrapMode: 'word' });
  const promptPanel = new BoxRenderable(renderer, {
    width: '100%',
    height: 10,
    flexDirection: 'column',
    border: true,
    borderColor: accentColor,
    backgroundColor: panelColor,
    padding: 1,
    gap: 1,
    visible: false,
  });
  const promptLabel = new TextRenderable(renderer, { height: 1, fg: accentColor });
  const manualInput = new InputRenderable(renderer, { width: '100%' });
  const suggestions = new SelectRenderable(renderer, {
    width: '100%',
    height: 4,
    showDescription: false,
    showScrollIndicator: true,
    wrapSelection: true,
    selectedBackgroundColor: '#313244',
    selectedTextColor: accentColor,
    visible: false,
  });
  const audioPanel = new BoxRenderable(renderer, {
    width: '100%',
    height: 10,
    flexDirection: 'column',
    border: true,
    borderColor: accentColor,
    backgroundColor: panelColor,
    padding: 1,
    gap: 1,
    visible: false,
  });
  const audioLabel = new TextRenderable(renderer, { height: 1, fg: accentColor });
  const audioSelector = new SelectRenderable(renderer, {
    width: '100%',
    height: 5,
    showDescription: true,
    showScrollIndicator: true,
    wrapSelection: true,
    selectedBackgroundColor: '#313244',
    selectedTextColor: accentColor,
  });
  const status = new TextRenderable(renderer, {
    content: 'Escolha uma pasta ou vídeo no navegador.',
    fg: accentColor,
  });
  let browserDirectory = process.cwd();
  let inputPath = '';
  let outputPath = '';
  let recursive = false;
  let audioTracks: number[] | undefined;
  let availableAudioTracks: AudioTrack[] = [];
  let running = false;
  let totalFiles = 0;
  let completedFiles = 0;
  let currentProgress = 0;
  const logEntries: string[] = [];
  let browserFocused = true;
  let promptMode: 'path' | 'named-output' | undefined;

  const refreshConfiguration = () => {
    configuration.content = [
      `Entrada\n${inputPath || 'não selecionada'}`,
      '',
      `Saída\n${outputPath || 'não selecionada'}`,
      '',
      `Modo: ${recursive ? 'pasta e subpastas' : 'arquivo único'}`,
      `Áudio: ${audioTracks?.length ? `faixas ${audioTracks.join(', ')}` : 'todas as faixas'}`,
    ].join('\n');
    queuePreview.content = inputPath && outputPath
      ? `Pronto para adicionar à fila\n${inputPath}\n→ ${outputPath}`
      : 'Nenhum trabalho configurado.\nSelecione uma entrada e uma saída para preparar a fila.';
  };
  const updateProgress = () => {
    const percent = totalFiles === 0
      ? 0
      : Math.round(((completedFiles + currentProgress / 100) / totalFiles) * 100);
    const filled = Math.round(percent / 5);
    progress.content = `[${'█'.repeat(filled)}${'░'.repeat(20 - filled)}] ${percent}%  ${completedFiles}/${totalFiles} concluídos`;
  };
  const addLog = (message: string) => {
    logEntries.unshift(message);
    logs.content = logEntries.slice(0, 3).join('\n');
  };
  const refreshAudioOptions = () => {
    audioSelector.options = availableAudioTracks.map((track) => ({
      name: `${audioTracks?.includes(track.index) ? '◉' : '○'} Faixa ${track.index}`,
      description: [track.codec, track.channels ? `${track.channels} canais` : '', track.language ?? '']
        .filter(Boolean)
        .join(' • '),
      value: track.index,
    }));
  };
  const closeAudioPanel = () => {
    audioPanel.visible = false;
    actions.focus();
  };
  const openAudioPanel = async () => {
    if (!inputPath) {
      status.content = 'Selecione uma entrada antes de escolher as faixas de áudio.';
      return;
    }

    audioPanel.visible = true;
    audioLabel.content = 'Buscando faixas de áudio...';
    audioSelector.options = [];

    try {
      const [file] = await expandGlobPattern(inputPath, recursive);

      if (!file) {
        status.content = 'Nenhum vídeo encontrado para analisar o áudio.';
        closeAudioPanel();
        return;
      }

      availableAudioTracks = await getAudioTracks(file);

      if (availableAudioTracks.length === 0) {
        status.content = 'O vídeo selecionado não possui faixas de áudio.';
        closeAudioPanel();
        return;
      }

      audioLabel.content = 'Enter alterna uma faixa  •  A usa todas  •  Esc confirma';
      refreshAudioOptions();
      audioSelector.focus();
    } catch (error) {
      status.content = error instanceof Error ? error.message : 'Não foi possível analisar o áudio.';
      closeAudioPanel();
    }
  };
  const startConversion = async () => {
    if (running) {
      return;
    }

    if (!inputPath || !outputPath) {
      status.content = 'Escolha uma entrada e uma saída antes de iniciar.';
      return;
    }

    running = true;
    totalFiles = 0;
    completedFiles = 0;
    currentProgress = 0;
    logEntries.length = 0;
    resetCancellation();
    addLog('Preparando conversão...');
    updateProgress();

    try {
      const results = await convertMultiple({
        input: inputPath,
        output: outputPath,
        recursive,
        audioTracks,
        manageSignals: false,
        onQueue: (files) => {
          totalFiles = files.length;
          updateProgress();
          addLog(`${files.length} vídeo(s) adicionado(s) à fila.`);
        },
        onStart: (file) => {
          currentProgress = 0;
          status.content = `Convertendo: ${file}`;
        },
        onProgress: (percent) => {
          currentProgress = percent;
          updateProgress();
        },
        onComplete: (file) => {
          completedFiles += 1;
          currentProgress = 0;
          updateProgress();
          addLog(`Concluído: ${file}`);
        },
        onError: (file, error) => {
          completedFiles += 1;
          currentProgress = 0;
          updateProgress();
          addLog(`Erro em ${file}: ${error.message.split('\n')[0]}`);
        },
      });

      const failed = results.filter((result) => !result.success).length;
      const summary = failed === 0
        ? `Conversão concluída: ${results.length} vídeo(s).`
        : `Conversão finalizada com ${failed} erro(s).`;
      status.content = summary;
      addLog(summary);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível iniciar a conversão.';
      status.content = message;
      addLog(`Erro: ${message}`);
    } finally {
      running = false;
    }
  };
  const cancelConversion = () => {
    if (!running) {
      status.content = 'Nenhuma conversão está em andamento.';
      return;
    }

    cancel();
    status.content = 'Cancelando conversão...';
    addLog('Cancelamento solicitado.');
  };
  const refreshBrowser = () => {
    const entries = getBrowserEntries(browserDirectory);
    const options: SelectOption[] = entries.map((entry) => ({
      name: entry.kind === 'video' ? `▶ ${entry.name}` : `▸ ${entry.name}`,
      description: entry.kind === 'video' ? 'Adicionar este vídeo à entrada' : 'Abrir pasta',
      value: entry,
    }));

    browser.options = options;
    browser.setSelectedIndex(0);
    location.content = `Pasta atual: ${browserDirectory}`;
  };
  const closePrompt = () => {
    promptMode = undefined;
    promptPanel.visible = false;
    suggestions.visible = false;
    (browserFocused ? browser : actions).focus();
  };
  const refreshSuggestions = (value: string) => {
    const options = getDirectorySuggestions(value, browserDirectory).map((path) => ({
      name: path,
      description: '',
      value: path,
    }));

    suggestions.options = options;
    suggestions.visible = options.length > 0;
    promptPanel.height = options.length > 0 ? 12 : 7;
    if (options.length > 0) {
      suggestions.setSelectedIndex(0);
    }
  };
  const applySuggestion = () => {
    const suggestion = suggestions.getSelectedOption();

    if (suggestion) {
      manualInput.value = suggestion.value as string;
      refreshSuggestions(manualInput.value);
      manualInput.focus();
    }
  };
  const openPrompt = (mode: 'path' | 'named-output') => {
    promptMode = mode;
    promptLabel.content = mode === 'path'
      ? 'Digite um caminho absoluto, relativo ou iniciado em ~  •  Tab completa  •  ↓ mostra sugestões'
      : 'Digite o nome da nova pasta de saída';
    manualInput.placeholder = mode === 'path' ? '/caminho/para/pasta' : 'ex.: vídeos-convertidos';
    manualInput.value = '';
    promptPanel.visible = true;
    refreshSuggestions('');
    suggestions.visible = mode === 'path' && suggestions.options.length > 0;
    promptPanel.height = mode === 'path' && suggestions.visible ? 12 : 7;
    manualInput.focus();
  };

  header.add(new TextRenderable(renderer, {
    content: 'RCONV  /  CONVERSOR DE VÍDEO',
    fg: '#d9e8ff',
  }));
  header.add(new TextRenderable(renderer, {
    content: 'Sessão local  •  FFmpeg pronto',
    fg: mutedColor,
  }));
  browserPanel.add(location);
  browserPanel.add(browser);
  actionsPanel.add(actions);
  detailsPanel.add(configuration);
  workspace.add(actionsPanel);
  workspace.add(browserPanel);
  workspace.add(detailsPanel);
  queuePanel.add(queuePreview);
  queuePanel.add(progress);
  queuePanel.add(logs);
  root.add(header);
  root.add(workspace);
  root.add(queuePanel);
  promptPanel.add(promptLabel);
  promptPanel.add(manualInput);
  promptPanel.add(suggestions);
  root.add(promptPanel);
  audioPanel.add(audioLabel);
  audioPanel.add(audioSelector);
  root.add(audioPanel);
  root.add(status);
  root.add(new TextRenderable(renderer, {
    content: '←/→: trocar painel  |  ↑/↓: navegar  |  P: caminho  |  N: nova pasta  |  Tab: completar  |  Esc: sair',
    fg: mutedColor,
  }));
  renderer.root.add(root);
  refreshBrowser();
  refreshConfiguration();
  updateProgress();
  browser.focus();

  browser.on(SelectRenderableEvents.ITEM_SELECTED, (_index, option) => {
    const entry = option.value as BrowserEntry;

    if (entry.kind === 'video') {
      inputPath = entry.path;
      recursive = false;
      status.content = `Vídeo selecionado: ${entry.name}`;
      refreshConfiguration();
      return;
    }

    browserDirectory = entry.path;
    refreshBrowser();
  });

  actions.on(SelectRenderableEvents.ITEM_SELECTED, (_index, option) => {
    switch (option.value) {
      case 'input':
        inputPath = join(browserDirectory, videoPattern);
        recursive = true;
        status.content = 'Pasta atual definida como entrada, incluindo subpastas.';
        break;
      case 'output':
        outputPath = browserDirectory;
        status.content = 'Pasta atual definida como saída.';
        break;
      case 'create-output':
        outputPath = createOutputDirectory(browserDirectory);
        status.content = `Pasta de saída criada: ${outputPath}`;
        refreshBrowser();
        break;
      case 'path':
        openPrompt('path');
        return;
      case 'named-output':
        openPrompt('named-output');
        return;
      case 'audio':
        void openAudioPanel();
        return;
      case 'all-audio':
        audioTracks = undefined;
        status.content = 'Todas as faixas de áudio selecionadas.';
        break;
      case 'start':
        void startConversion();
        return;
      case 'cancel':
        cancelConversion();
        return;
      case 'home':
        browserDirectory = homedir();
        refreshBrowser();
        status.content = 'Pasta pessoal aberta.';
        break;
      case 'preview':
        status.content = inputPath && outputPath
          ? 'Configuração pronta para entrar na fila de conversão.'
          : 'Escolha uma entrada e uma saída primeiro.';
        break;
    }

    refreshConfiguration();
  });

  manualInput.on(InputRenderableEvents.ENTER, (value: string) => {
    if (promptMode === 'path') {
      const directory = resolveDirectoryPath(value, browserDirectory);

      if (!directory) {
        status.content = 'Não foi possível abrir essa pasta.';
        return;
      }

      browserDirectory = directory;
      refreshBrowser();
      status.content = 'Pasta aberta.';
      closePrompt();
      return;
    }

    if (promptMode === 'named-output') {
      try {
        outputPath = createNamedOutputDirectory(browserDirectory, value);
        status.content = `Pasta de saída criada: ${outputPath}`;
        refreshBrowser();
        refreshConfiguration();
        closePrompt();
      } catch (error) {
        status.content = error instanceof Error ? error.message : 'Não foi possível criar a pasta.';
      }
    }
  });

  manualInput.on(InputRenderableEvents.INPUT, (value: string) => {
    if (promptMode === 'path') {
      refreshSuggestions(value);
    }
  });

  suggestions.on(SelectRenderableEvents.ITEM_SELECTED, () => {
    applySuggestion();
  });

  audioSelector.on(SelectRenderableEvents.ITEM_SELECTED, (_index, option) => {
    const trackIndex = option.value as number;
    const selectedTracks = audioTracks?.includes(trackIndex)
      ? audioTracks.filter((index) => index !== trackIndex)
      : [...(audioTracks ?? []), trackIndex];

    audioTracks = selectedTracks.length > 0 ? selectedTracks : undefined;
    refreshAudioOptions();
    refreshConfiguration();
  });

  renderer.keyInput.on('keypress', (key) => {
    if (audioPanel.visible) {
      if (key.name === 'a') {
        key.preventDefault();
        audioTracks = undefined;
        refreshAudioOptions();
        refreshConfiguration();
        return;
      }

      if (key.name === 'escape') {
        key.preventDefault();
        closeAudioPanel();
        return;
      }
    }

    if (!manualInput.focused && key.name === 'p') {
      key.preventDefault();
      openPrompt('path');
      return;
    }

    if (!manualInput.focused && key.name === 'n') {
      key.preventDefault();
      openPrompt('named-output');
      return;
    }

    if (promptMode === 'path' && (manualInput.focused || suggestions.focused)) {
      if (key.name === 'tab') {
        key.preventDefault();
        applySuggestion();
        return;
      }

      if (manualInput.focused && key.name === 'down' && suggestions.visible) {
        key.preventDefault();
        suggestions.focus();
        return;
      }
    }

    if (!manualInput.focused && !suggestions.focused && !audioPanel.visible && key.name === 'left') {
      key.preventDefault();
      browserFocused = false;
      actions.focus();
      return;
    }

    if (!manualInput.focused && !suggestions.focused && !audioPanel.visible && key.name === 'right') {
      key.preventDefault();
      browserFocused = true;
      browser.focus();
      return;
    }

    if (key.ctrl && key.name === 'c' && running) {
      key.preventDefault();
      cancelConversion();
      return;
    }

    if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
      key.preventDefault();
      if (manualInput.focused) {
        closePrompt();
      } else {
        renderer.destroy();
      }
    }
  });

  await new Promise<void>((resolve) => {
    renderer.once('destroy', resolve);
  });
}
