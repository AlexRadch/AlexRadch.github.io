---
title: "Jev за 25 строк на Python"
description: "Перевод поста NobodyWho: Jev — как локальный классификатор на логитах, 25 строк кода на Python."
date: 2026-09-24T02:46:20+07:00
images: ["https://www.nobodywho.ai/assets/images/blog/2026/jev-in-25-lines/jev.png"]
params:
  bookSectionDepth: 0
---

# Jev за 25 строк на Python

Перевод статьи [«Jev in 25 lines of Python»](https://www.nobodywho.ai/posts/jev-in-25-lines/) (автор — Duarte O.Carmo, NobodyWho, 22 сентября 2026 года).

Версия для Хабра: [https://habr.com/ru/articles/1085890/](https://habr.com/ru/articles/1085890/)

## Перевод

![My name is Jev](https://www.nobodywho.ai/assets/images/blog/2026/jev-in-25-lines/jev.png)

Все кому не лень говорят о [Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev). Jev тут, Jev там. Все в Twitter только и говорят о Jev, что это следующее достижение больших языковых моделей и парадигмы ИИ. Мы в этом не уверены. Поэтому вот Jev за 25 строк на Python.

Загрузим модель.

```python
# /// script
# requires-python = ">=3.12"
# dependencies = ["huggingface-hub", "llama-cpp-python", "numpy"]
# ///

import numpy
from llama_cpp import Llama

# Really, you can use any GGUF model from https://huggingface.co/models?library=gguf

model = Llama.from_pretrained(
    repo_id="Qwen/Qwen3-0.6B-GGUF",
    filename="Qwen3-0.6B-Q8_0.gguf",
    n_ctx=512,
    logits_all=True,
    verbose=False,
)
```

Подготовим промпт и укажем варианты.

```python
labels = ["A", "B", "C"]
choices = ["Legitimate", "Spam", "Phishing"]
email = "Payroll asks for your password on a non-company sign-in page."
options = "\n".join(
    f"{label}. {choice}" for label, choice in zip(labels, choices, strict=True)
)
prompt = f"""<|im_start|>system
Choose one option.<|im_end|>
<|im_start|>user
Email: {email}\n\n{options}<|im_end|>
<|im_start|>assistant
<think>\n\n</think>\n\n"""
model.eval(tokens=model.tokenize(text=prompt.encode(), add_bos=False, special=True))
```

Выжмем из логитов вероятности. *(прим. перев.: логиты — сырые, ненормированные оценки для каждого варианта ответа).*

```python
logits = model.scores[model.n_tokens - 1]
token_ids = [model.tokenize(text=label.encode(), add_bos=False)[0] for label in labels]
choice_logits = numpy.asarray([logits[token_id] for token_id in token_ids])
logprobs = choice_logits - numpy.logaddexp.reduce(choice_logits)
probabilities = numpy.exp(logprobs)

for name, scores in (
    ("Logits", choice_logits),
    ("Log probabilities", logprobs),
    ("Probabilities", probabilities),
):
    values = numpy.round(scores.astype(float), 3).tolist()
    print(f"{name}:", dict(zip(choices, values, strict=True)))

# Logits: {'Legitimate': 26.254, 'Spam': 27.262, 'Phishing': 29.614}
# Log probabilities: {'Legitimate': -3.482, 'Spam': -2.474, 'Phishing': -0.122}
# Probabilities: {'Legitimate': 0.031, 'Spam': 0.084, 'Phishing': 0.885}
```

Вот. Это и есть Jev.

## Но нет, вы не понимаете Jev!

Да, мы в курсе.

- Мы не называем это [моделью решений System One](https://typesafe.ai/blog/introducing-system-one-models-and-jev).
- Мы не вызывали API.
- Мы не создавали тонны синтетических данных.
- Мы не обучали модель методом [обучения с подкреплением для калиброванных решений (Reinforcement Learning for Calibrated Decisions, RLCD)](https://typesafe.ai/blog/introducing-system-one-models-and-jev), чтобы откалибровать решения и вероятности (хотя они и [не всегда правильные](https://arcturus-labs.com/blog/2026/09/16/typesafes-jev-trades-text-generation-for-instant-calibrated-decisions/)).

## Но да. Это и есть Jev.

- Он классифицирует: получает промпт с вариантами и возвращает вероятности.
- Он быстрый.
- Он локальный.
- Ваши данные никуда не отправляются.

А нам нравится никуда не отправлять ваши данные. Попробуйте [NobodyWho](https://github.com/nobodywho-ooo/nobodywho).

*(заметка: это пародийный пост, вот ссылки на более полные открытые реализации Jev: [OpenJev](https://openjev.com/), [openjev-sglang](https://github.com/ekzhang/openjev-sglang) и [OpenJev on DiffusionGemma](https://github.com/razorback16/openjev).)*

---
Всё, что делает NobodyWho, — опенсорс, поставьте нам [звезду на GitHub](https://github.com/nobodywho-ooo/nobodywho), чтобы поддержать нас ❤️

*Опубликовано 22 сентября 2026 года, автор — Duarte O.Carmo*
