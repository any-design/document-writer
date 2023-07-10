# document-writer

AI document writer powered by GPT for Vue components.

## Usage

(Note: this package has not been published yet)

```
npm i @any-design/document-writer
```

The use it by a command line:

```bash
dw ./src/packages -o ./docs/components --language English
```

At current, it only support Azure OpenAI API, you should set the `azure_openai_endpoint`, `azure_openai_key` and `azure_openai_model` by this command line after all the generation:

```bash
dw config set <key> <value>
```

To specify an example for the generation, you can create a file named `.documentwriter` in your project root, and put the following content in it:

```json
{
  "example": "path/to/example.md"
}
```

## License

MIT
